'use client';

import { useState } from 'react';
import ChatMessage from '@/components/ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: data.response,
          citations: data.citations 
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md min-h-[600px] flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold text-center">Church Handbook Chat Assistant</h1>
          <div className="mt-2 text-sm text-gray-600 text-center">
            <p className="font-medium">Important Disclaimer</p>
            <p className="text-xs">This is an unofficial third-party tool and is not affiliated with, operated by, or endorsed by The Church of Jesus Christ of Latter-day Saints. For official Church resources, please visit <a href="https://www.churchofjesuschrist.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">churchofjesuschrist.org</a>.</p>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              citations={message.citations}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 rounded-lg px-4 py-2">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
