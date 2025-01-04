'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from '@/components/ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

const WELCOME_MESSAGE = {
  role: 'assistant' as const,
  content: "Welcome! I'm here to help you understand the General Handbook of The Church of Jesus Christ of Latter-day Saints. You can ask me questions about policies, procedures, or any specific sections of the handbook.",
  citations: []
};

const EXAMPLE_QUESTIONS = [
  "What are the responsibilities of a bishop?",
  "How are temple recommends issued?",
  "What is the policy on youth activities?",
  "Explain the church's guidelines on music in meetings"
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent, overrideMessage?: string) => {
    e.preventDefault();
    const messageToSend = overrideMessage || input;
    if ((!messageToSend.trim() && !overrideMessage) || isLoading) return;

    setInput('');
    setSelectedQuestion(null);
    setMessages((prev) => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
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

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question);
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Church Handbook Chat Assistant</h1>
              </div>
              <a 
                href="https://www.churchofjesuschrist.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium group flex items-center gap-1"
              >
                Visit Official Church Website
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-800 font-medium mb-1">Important Disclaimer</p>
              <p className="text-xs text-red-700">This is an unofficial third-party tool and is not affiliated with, operated by, or endorsed by The Church of Jesus Christ of Latter-day Saints. For official Church resources and handbook access, please visit the official Church website.</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  citations={message.citations}
                />
              ))}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <p className="text-sm text-gray-600 mb-3">Try asking about:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EXAMPLE_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionClick(question)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-all
                          ${selectedQuestion === question
                            ? 'border-navy-600 text-navy-700 bg-navy-50'
                            : 'border-gray-200 text-gray-600 hover:border-navy-200 hover:bg-navy-50'
                          }`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex justify-start mb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                      <p className="text-gray-500 text-[15px]">Searching handbook...</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6 shadow-lg">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the handbook..."
                className="flex-1 min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 text-[15px] placeholder-gray-400 focus:border-navy-600 focus:ring-1 focus:ring-navy-600 focus:outline-none transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center rounded-xl bg-navy-600 px-5 py-3 text-[15px] font-medium text-white hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
              >
                <span>Send</span>
                <svg 
                  className="ml-2 -mr-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
