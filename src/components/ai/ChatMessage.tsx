import { MessageCircle, Bot } from "lucide-react";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-start gap-2 max-w-[80%] ${
          role === 'user' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {role === 'user' ? (
            <MessageCircle className="h-4 w-4 text-blue-500" />
          ) : (
            <Bot className="h-4 w-4 text-gray-600" />
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${
            role === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
};