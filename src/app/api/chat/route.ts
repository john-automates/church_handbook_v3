import { NextResponse } from 'next/server';
import { openai, assistantId } from '@/lib/openai';

export const maxDuration = 300; // Set maximum duration to 300 seconds (5 minutes)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log('API Route: Starting request processing');
    
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.error('API Route: Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    if (!assistantId) {
      console.error('API Route: Missing Assistant ID');
      return NextResponse.json(
        { error: 'Assistant ID is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    let message;
    try {
      const body = await req.json();
      message = body.message;
      console.log('API Route: Received message:', { messageLength: message?.length });
    } catch (error) {
      console.error('API Route: Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Create thread
    console.log('API Route: Creating thread');
    let thread;
    try {
      thread = await openai.beta.threads.create();
      console.log('API Route: Thread created:', { threadId: thread.id });
    } catch (error) {
      console.error('API Route: Failed to create thread:', error);
      return NextResponse.json(
        { error: 'Failed to create chat thread' },
        { status: 500 }
      );
    }

    // Add message to thread
    console.log('API Route: Adding message to thread');
    try {
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: message,
      });
      console.log('API Route: Message added to thread');
    } catch (error) {
      console.error('API Route: Failed to add message to thread:', error);
      return NextResponse.json(
        { error: 'Failed to add message to thread' },
        { status: 500 }
      );
    }

    // Run the assistant
    console.log('API Route: Starting assistant run');
    let run;
    try {
      run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId as string,
      });
      console.log('API Route: Assistant run created:', { runId: run.id });
    } catch (error) {
      console.error('API Route: Failed to start assistant run:', error);
      return NextResponse.json(
        { error: 'Failed to start assistant processing' },
        { status: 500 }
      );
    }

    // Wait for completion with timeout and polling
    console.log('API Route: Waiting for run completion');
    let runStatus;
    const startTime = Date.now();
    const MAX_ATTEMPTS = 60; // Maximum number of polling attempts
    const POLL_INTERVAL = 5000; // Poll every 5 seconds
    let attempts = 0;
    
    try {
      while (attempts < MAX_ATTEMPTS) {
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log('API Route: Run status:', { 
          status: runStatus.status,
          attempt: attempts + 1,
          elapsedTime: `${Math.round((Date.now() - startTime) / 1000)}s`
        });
        
        if (runStatus.status === 'completed') break;
        
        if (runStatus.status === 'failed') {
          throw new Error(`Run failed: ${runStatus.last_error?.message || 'Unknown error'}`);
        }

        if (runStatus.status === 'expired') {
          throw new Error('Assistant run expired');
        }
        
        // If still running, wait before next poll
        if (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          attempts++;
          continue;
        }

        // If we get an unexpected status
        throw new Error(`Unexpected run status: ${runStatus.status}`);
      }

      if (attempts >= MAX_ATTEMPTS) {
        throw new Error('Maximum polling attempts reached');
      }
    } catch (error) {
      console.error('API Route: Error during run completion:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to process request' },
        { status: 500 }
      );
    }

    // Get the assistant's response
    console.log('API Route: Retrieving messages');
    let messages;
    try {
      messages = await openai.beta.threads.messages.list(thread.id);
      console.log('API Route: Retrieved messages count:', messages.data.length);
    } catch (error) {
      console.error('API Route: Failed to retrieve messages:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve assistant response' },
        { status: 500 }
      );
    }

    // Process the response
    const assistantMessage = messages.data.find(msg => msg.role === "assistant");
    if (!assistantMessage) {
      console.error('API Route: Assistant message not found in response');
      return NextResponse.json(
        { error: "Assistant's message not found" },
        { status: 500 }
      );
    }

    // Process message content and citations
    let processedText = '';
    const citations: string[] = [];

    try {
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
              console.error('API Route: Error processing citation:', error);
              const citationText = `(Unknown)`;
              processedText = processedText.replace(annotation.text, citationText);
              citations.push(`Error retrieving file`);
            }
          }
        }
      }
    } catch (error) {
      console.error('API Route: Error processing message content:', error);
      return NextResponse.json(
        { error: 'Failed to process assistant response' },
        { status: 500 }
      );
    }

    console.log('API Route: Successfully completed request');
    return NextResponse.json({ 
      response: processedText, 
      citations: citations,
      threadId: thread.id 
    });

  } catch (error) {
    console.error('API Route: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 