import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; 
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../externaluicomponents/sheet';
import { Button } from '../externaluicomponents/button';
import { Send, Bot, Sparkles, User, AlertCircle, X } from 'lucide-react';
import type { Message } from '../store/advisory/advisorySlice';

interface AdvisoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatHistory: Message[];
  isLoading: boolean;
  onAskAI: (question: string) => void;
}

export function AdvisoryPanel({ 
  open, 
  onOpenChange, 
  chatHistory, 
  isLoading, 
  onAskAI 
}: AdvisoryPanelProps) {
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (open && chatHistory.length === 0 && !isLoading) {
      onAskAI("Analyze the overall organizational health based on the latest data.");
    }
  }, [open]); 

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onAskAI(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return 'Just now';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Just now';
    return parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Detect if AI content is structured (has headers, lists, bold text)
  const isStructuredContent = (content: string): boolean => {
    return /^#{1,3}\s|^\*\*|^\-\s|^\d+\.\s|\n#{1,3}\s|\n\*\*|\n\-\s|\n\d+\.\s/m.test(content);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent 
        side="right" 
        className="w-[450px] sm:w-[500px] p-0 flex flex-col bg-gray-50/90 backdrop-blur-sm shadow-2xl border-l border-gray-200"
        
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        
        {/* --- HEADER --- */}
        <div className="p-5 border-b border-gray-200 bg-white/95 shadow-sm z-10 flex items-start justify-between">
            {/* Title & Context */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <SheetTitle className="text-lg font-bold text-gray-800">Operational Advisor</SheetTitle>
              </div>
              <SheetDescription className="text-sm text-gray-500 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Bot className="h-3 w-3" />
                  AI Agent
                </span>
              </SheetDescription>
            </div>

            {/* CLOSE BUTTON */}
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 -mt-1 -mr-2"
            >
              <X className="h-5 w-5" />
            </Button>
        </div>

        {/* --- CHAT BODY --- */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {chatHistory.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const hasStructuredContent = !isUser && isStructuredContent(msg.content);
            
            return (
              <div key={idx} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`
                  h-9 w-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm
                  ${isUser ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}
                `}>
                  {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-emerald-600" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    rounded-2xl text-sm leading-relaxed
                    ${isUser 
                      ? 'px-4 py-3 bg-blue-600 text-white rounded-tr-none shadow-sm' 
                      : hasStructuredContent
                        ? 'px-5 py-4 bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-md ring-1 ring-gray-100'
                        : 'px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'}
                  `}>
                    {isUser ? (
                      msg.content
                    ) : (
                      <ReactMarkdown 
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-base font-bold text-gray-900 mt-3 mb-2 first:mt-0 border-b border-gray-100 pb-1" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-sm font-bold text-blue-800 mt-4 mb-2 first:mt-0 uppercase tracking-wide" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 mt-3 mb-1 first:mt-0" {...props} />,
                          strong: ({node, ...props}) => <span className="font-bold text-gray-900 bg-yellow-50 px-1 rounded" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1.5 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1.5 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-700 leading-relaxed" {...props} />,
                          p: ({node, ...props}) => (
                            <p
                              className="prose prose-sm max-w-none text-gray-800 prose-p:my-2 prose-headings:text-gray-900 prose-headings:font-bold prose-headings:my-2 prose-ul:my-1 prose-li:my-0 leading-relaxed"
                              {...props}
                            />
                          ),
                          code: ({node, ...props}) => (
                            <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                          ),
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-blue-300 pl-3 py-1 my-2 bg-blue-50/50 italic text-gray-700" {...props} />
                          )
                        }}
                      >
                        {msg.content}
                    </ReactMarkdown>
                    )}
                  </div>
                  
                  {/* Timestamp (Darkened for visibility) */}
                  <span className="text-[11px] text-gray-500 font-medium mt-1 flex items-center gap-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading State */}
          {isLoading && (
            <div className="flex gap-4">
               <div className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-emerald-600" />
               </div>
               <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                 <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Analyzing metrics...</span>
                 </div>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="relative flex items-center gap-2">
            <input
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              placeholder="Ask a strategic question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={isLoading || !inputValue.trim()}
              className={`
                absolute right-1.5 h-9 w-9 rounded-lg transition-all
                ${!inputValue.trim() ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}
              `}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Footer Disclaimer (Darkened) */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
             <AlertCircle className="h-3 w-3 text-gray-500" />
             <p className="text-[10px] text-gray-500 font-medium text-center">
               AI insights generated via Google Gemini. Verify critical data manually.
             </p>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}