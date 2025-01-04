import { NextResponse } from 'next/server';
import { openai, assistantId } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Create a thread if it's the first message
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId as string,
    });

    // Wait for the completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed');
      }
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log('Retrieved messages:', messages.data.length);

    // Identify the assistant's response
    const assistantMessage = messages.data.find(msg => msg.role === "assistant");

    if (!assistantMessage) {
      throw new Error("Assistant's message not found.");
    }

    // Process the assistant's message and annotations
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
            console.error(`Error retrieving file ${fileCitation.file_id}:`, error);
            const citationText = `(Unknown)`;
            processedText = processedText.replace(annotation.text, citationText);
            citations.push(`Error retrieving file`);
          }
        }
      }
    }

    console.log('Processed assistant response');

    return NextResponse.json({ 
      response: processedText, 
      citations: citations,
      threadId: thread.id 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the chat message' },
      { status: 500 }
    );
  }
} 