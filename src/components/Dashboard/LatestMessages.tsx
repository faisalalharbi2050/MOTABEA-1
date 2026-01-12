import React from 'react';
import { MessageSquare, Clock, User, ArrowLeft, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LatestMessagesProps {
  messages: {
    id: string;
    content: string;
    body?: string;
    to: string;
    from: string;
    time: string;
  }[];
}

const LatestMessages: React.FC<LatestMessagesProps> = ({ messages }) => {
  const [selectedMessage, setSelectedMessage] = React.useState<{
    id: string;
    content: string;
    body?: string;
    to: string;
    from: string;
    time: string;
  } | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-full relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#e5e1fe] flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-[#655ac1]" />
              </div>
              آخر الرسائل
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.length > 0 ? (
             <div className="space-y-3">
               {messages.map((msg) => (
                 <div key={msg.id} className="p-3 rounded-xl bg-gray-50 hover:bg-[#f6f5ff] border border-transparent hover:border-[#e5e1fe] transition-colors group cursor-pointer" onClick={() => setSelectedMessage(msg)}>
                   <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 flex-1 ml-2">{msg.content}</p>
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                              <Clock className="w-3 h-3" /> {msg.time}
                          </span>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-100 text-[#655ac1]">
                              <User className="w-3 h-3" /> {msg.from}
                          </span>
                          <ArrowLeft className="w-3 h-3 text-gray-300" />
                          <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-gray-100 text-green-600">
                              <User className="w-3 h-3" /> {msg.to}
                          </span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[#655ac1] text-[10px] font-medium flex items-center gap-1">
                                عرض التفاصيل <Eye className="w-3 h-3" />
                            </span>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
          ) : (
              <p className="text-center text-gray-400 py-8 text-xs">لا توجد رسائل حديثة</p>
          )}
        </div>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-l from-[#655ac1] to-[#8779fb] p-6 text-white">
             <DialogHeader className="text-right sm:text-right p-0">
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                    <MessageSquare className="w-5 h-5 opacity-80" />
                    {selectedMessage?.content}
                </DialogTitle>
             </DialogHeader>
             <div className="mt-4 flex items-center justify-between text-white/90 text-sm bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 opacity-75" />
                        <span className="font-medium">{selectedMessage?.from}</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 opacity-50" />
                    <div className="flex items-center gap-1.5">
                         <span className="font-medium">{selectedMessage?.to}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded text-xs">
                    <Clock className="w-3 h-3" />
                    <span dir="ltr">{selectedMessage?.time}</span>
                </div>
             </div>
          </div>
          
          <div className="p-6 bg-white min-h-[200px]">
             <div className="text-gray-700 leading-8 text-sm whitespace-pre-wrap font-medium">
                {selectedMessage?.body || selectedMessage?.content}
             </div>
             
             <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button 
                    onClick={() => setSelectedMessage(null)}
                    className="px-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                    إغلاق
                </button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LatestMessages;
