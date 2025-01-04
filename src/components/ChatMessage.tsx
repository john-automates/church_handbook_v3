import { getSectionUrl } from '@/utils/sections';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

export default function ChatMessage({ role, content, citations }: ChatMessageProps) {
  const handleCitationClick = (citation: string) => {
    const url = getSectionUrl(citation);
    if (url) {
      window.open(url, '_blank');
    } else {
      console.log('No URL found for citation:', citation);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )}
      
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
          ${role === 'user'
            ? 'bg-navy-600 text-white ml-auto'
            : 'bg-white border border-gray-200 text-gray-800'
          }`}
      >
        <p className="text-[15px] leading-relaxed">{content}</p>
        {citations && citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-opacity-20 border-current">
            <p className="text-xs font-medium mb-2 opacity-90">Sources:</p>
            <ul className="space-y-1.5">
              {citations.map((citation, index) => {
                const url = getSectionUrl(citation);
                return (
                  <li 
                    key={index} 
                    className={`text-xs flex items-center gap-2 ${
                      url 
                        ? `${role === 'user' ? 'text-blue-200 hover:text-blue-100' : 'text-blue-600 hover:text-blue-700'} cursor-pointer`
                        : 'opacity-75'
                    }`}
                    onClick={() => url && handleCitationClick(citation)}
                  >
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span>{citation}</span>
                    {!url && (
                      <span className="text-red-400 text-xs">(no link found)</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </motion.div>
  );
} 