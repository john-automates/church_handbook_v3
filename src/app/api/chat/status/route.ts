import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get threadId and runId from URL parameters
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const runId = searchParams.get('runId');

    if (!threadId || !runId) {
      return NextResponse.json(
        { error: 'Missing threadId or runId' },
        { status: 400 }
      );
    }

    // Get run status
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log('Status Route: Run status:', { status: runStatus.status });

    if (runStatus.status === 'completed') {
      // Fetch messages if completed
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(msg => msg.role === "assistant");

      if (!assistantMessage) {
        return NextResponse.json(
          { error: "Assistant's message not found" },
          { status: 500 }
        );
      }

      // Process message content and citations
      let processedText = '';
      const citations: string[] = [];

      if (assistantMessage.content && assistantMessage.content[0].type === 'text') {
        const textContent = assistantMessage.content[0].text;
        processedText = textContent.value;

        for (const annotation of textContent.annotations) {
          if ('file_citation' in annotation) {
            const fileCitation = annotation.file_citation;
            try {
              const citedFile = await openai.files.retrieve(fileCitation.file_id);
              let filename = citedFile.filename;
              if (filename.endsWith('.md')) {
                filename = filename.slice(0, -3);
              }
              const citationText = `(${filename})`;
              processedText = processedText.replace(annotation.text, citationText);
              citations.push(filename);
            } catch (error) {
              console.error('Status Route: Error processing citation:', error);
              const citationText = `(Unknown)`;
              processedText = processedText.replace(annotation.text, citationText);
              citations.push(`Error retrieving file`);
            }
          }
        }
      }

      return NextResponse.json({
        status: runStatus.status,
        completed: true,
        response: processedText,
        citations: citations
      });
    }

    if (runStatus.status === 'failed') {
      return NextResponse.json({
        status: runStatus.status,
        completed: true,
        error: runStatus.last_error?.message || 'Unknown error'
      });
    }

    // For in_progress, queued, etc.
    return NextResponse.json({
      status: runStatus.status,
      completed: false
    });

  } catch (error) {
    console.error('Status Route: Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 