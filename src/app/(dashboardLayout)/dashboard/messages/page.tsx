import { MessageSquare, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const conversations = [
    { id: 1, name: "Jatra Support", lastMessage: "Your booking has been confirmed.", time: "10:30 AM", unread: true },
    { id: 2, name: "Service Center", lastMessage: "The parts have arrived for your repair.", time: "Yesterday", unread: false },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">Chat with support and service centers.</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-9 pr-4 py-2 border rounded-md outline-none focus:border-primary text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(c => (
              <div key={c.id} className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${c.unread ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-semibold text-sm">{c.name}</h4>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className={`text-xs truncate ${c.unread ? 'text-[#1a1a1a] font-medium' : 'text-muted-foreground'}`}>{c.lastMessage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-muted/20">
          <div className="p-4 border-b bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                JS
              </div>
              <div>
                <h3 className="font-bold">Jatra Support</h3>
                <p className="text-xs text-emerald-500 font-medium">Online</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            <div className="self-start bg-card border px-4 py-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
              <p className="text-sm">Hello! How can we help you today?</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">10:28 AM</span>
            </div>
            <div className="self-end bg-primary text-primary-foreground px-4 py-3 rounded-lg rounded-tr-none max-w-[80%] shadow-sm">
              <p className="text-sm">I need an update on my service booking.</p>
              <span className="text-[10px] text-primary-foreground/70 mt-1 block">10:29 AM</span>
            </div>
            <div className="self-start bg-card border px-4 py-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm">
              <p className="text-sm">Your booking has been confirmed. The mechanic is ready.</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">10:30 AM</span>
            </div>
          </div>

          <div className="p-4 border-t bg-card flex gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 px-4 py-2 border rounded-md outline-none focus:border-primary text-sm"
            />
            <Button size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
