import React, { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { sendMessageToAI } from '../ai/conversationManager';

export function AISidebar({ className }) {
  const { aiMessages, appendAIMessage } = useBuilderStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    appendAIMessage({ role: "user", text: userMsg });
    setIsLoading(true);
    
    try {
      await sendMessageToAI(userMsg);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <aside className={cn("flex flex-col bg-[#FAFAFB] border-l border-[#EDEDF0]", className)}>
      <div className="p-4 border-b border-[#EDEDF0] bg-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[#514BEE]" />
        <h3 className="font-bold text-[#0F1223] text-sm">Gilan AI Co-Pilot</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
        {aiMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-12 h-12 bg-[#F3F1FF] text-[#514BEE] rounded-2xl flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="font-semibold text-[#0F1223] text-sm">Size nasıl yardımcı olabilirim?</p>
              <p className="text-xs text-[#7D7DA6] mt-1 max-w-[200px] mx-auto">Grafikler oluşturabilir, filtreleri değiştirebilir ve analiz yapabilirim.</p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-4">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(prompt)}
                  className="text-left px-3 py-2 text-xs border border-[#EDEDF0] bg-[#FAFAFB] rounded-lg text-[#0F1223] hover:border-[#514BEE] hover:text-[#514BEE] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {aiMessages.map((msg, i) => (
          <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
              msg.role === 'user' 
                ? "bg-[#514BEE] text-white rounded-tr-sm" 
                : "bg-[#FAFAFB] border border-[#EDEDF0] text-[#0F1223] rounded-tl-sm"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex w-full justify-start">
             <div className="bg-[#FAFAFB] border border-[#EDEDF0] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-[#B4B4C8] rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-[#B4B4C8] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
               <span className="w-1.5 h-1.5 bg-[#B4B4C8] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
             </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-[#EDEDF0] bg-white">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Örn: Trendyol kanal kâr grafiği ekle..."
          rows={2}
          className="w-full resize-none text-sm p-3 border border-[#EDEDF0] rounded-xl outline-none focus:border-[#514BEE] bg-[#FAFAFB] focus:bg-white transition-colors"
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()} 
          className="mt-2 w-full bg-[#0F1223] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          Gönder
        </button>
      </div>
    </aside>
  );
}

const SUGGESTED_PROMPTS = [
  "Trendyol kanal kârını son 90 günde göster",
  "En çok satış yapılan kategoriler",
  "Tarih filtresini son 7 gün yap",
];
