import { NextResponse } from 'next/server';
import { openai, assistantId } from '@/lib/openai';

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

    // Return the thread and run IDs for status checking
    return NextResponse.json({ 
      threadId: thread.id,
      runId: run.id
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