import { getSectionUrl } from '@/utils/sections';

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
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{content}</p>
        {citations && citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p className="text-xs font-semibold mb-1">Sources:</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              {citations.map((citation, index) => {
                const url = getSectionUrl(citation);
                return (
                  <li 
                    key={index} 
                    className={`${url ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-gray-600'} flex items-center gap-2`}
                    onClick={() => handleCitationClick(citation)}
                  >
                    <span>{citation}</span>
                    {!url && (
                      <span className="text-red-500 text-xs">(no link found)</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 