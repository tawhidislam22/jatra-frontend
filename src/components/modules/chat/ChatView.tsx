"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Car, 
  Wrench, 
  Building2, 
  Calendar, 
  Clock, 
  Check, 
  CheckCheck,
  ChevronLeft,
  User as UserIcon,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { messagesService } from "@/services/messages.service";
import { Conversation, Message } from "@/types/jatra";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ChatViewProps {
  basePath?: string;
  portalTitle?: string;
}

export function ChatView({ basePath = "/dashboard/messages", portalTitle = "Messages & Inquiries" }: ChatViewProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryParamConvId = searchParams.get("conversationId");

  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(queryParamConvId);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => messagesService.getConversations(),
    refetchInterval: 4000,
  });

  // Automatically select first conversation or one from URL
  useEffect(() => {
    if (queryParamConvId) {
      setSelectedId(queryParamConvId);
      setShowMobileChat(true);
    } else if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [queryParamConvId, conversations, selectedId]);

  // 2. Fetch messages for selected conversation
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => (selectedId ? messagesService.getMessages(selectedId) : null),
    enabled: !!selectedId,
    refetchInterval: 3000,
  });

  const activeConversation = conversations.find((c) => c.id === selectedId) || messagesData?.conversation;
  const messages: Message[] = messagesData?.messages || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark conversation as read on selection
  useEffect(() => {
    if (selectedId) {
      messagesService.markAsRead(selectedId).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  }, [selectedId, queryClient]);

  // 3. Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text: string) => messagesService.sendMessage(selectedId!, text),
    onSuccess: () => {
      setInputText("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Message sent");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send message");
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedId || sendMutation.isPending) return;
    sendMutation.mutate(inputText.trim());
  };

  const pathname = usePathname();
  const isOwnerOrMechanic =
    user?.role === "OWNER" ||
    user?.role === "MECHANIC" ||
    user?.role === "ADMIN" ||
    basePath.includes("/owner") ||
    basePath.includes("/mechanic") ||
    basePath.includes("/admin") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/mechanic") ||
    pathname.startsWith("/admin");

  const getConversationDetails = (conv: Conversation) => {
    const isCenterAdmin = Boolean(user?.id && conv.center?.adminId && user.id === conv.center.adminId);
    const otherIsCustomer = conv.otherParticipant?.role === "CUSTOMER";
    const shouldShowCustomer = isOwnerOrMechanic || isCenterAdmin || (otherIsCustomer && user?.role !== "CUSTOMER");

    // When viewed from Owner/Mechanic/Admin portal or when the other participant is the customer:
    // ALWAYS display the customer's actual full name, avatar, and contact details!
    if (shouldShowCustomer) {
      const customer =
        (conv.serviceRequest?.customer?.name !== conv.center?.name ? conv.serviceRequest?.customer : null) ||
        (conv.rentalBooking?.customer?.name !== conv.center?.name ? conv.rentalBooking?.customer : null) ||
        (conv.otherParticipant?.name !== conv.center?.name ? conv.otherParticipant : null) ||
        conv.serviceRequest?.customer ||
        conv.rentalBooking?.customer ||
        conv.otherParticipant;

      let name =
        customer?.fullName?.trim() ||
        customer?.name?.trim() ||
        (customer?.email ? customer.email.split("@")[0] : "") ||
        "Customer";

      // Extra safeguard: under owner/mechanic view, never display the center's own name as the customer title
      if (conv.center?.name && name.toLowerCase() === conv.center.name.toLowerCase()) {
        const alt = [
          conv.serviceRequest?.customer?.fullName,
          conv.serviceRequest?.customer?.name,
          conv.rentalBooking?.customer?.fullName,
          conv.rentalBooking?.customer?.name,
          conv.otherParticipant?.fullName,
          conv.otherParticipant?.name
        ].find((n) => n && n.trim().toLowerCase() !== conv.center!.name.toLowerCase());

        name = alt?.trim() || "Customer";
      }

      const initial = name.charAt(0).toUpperCase();
      const badge = customer?.role || "CUSTOMER";
      const subtitle =
        [customer?.email, customer?.phone].filter(Boolean).join(" • ") ||
        (conv.center?.name ? `Customer at ${conv.center.name}` : "Customer");

      return {
        title: name,
        initial,
        badge,
        subtitle,
        isCustomerUser: true,
        centerName: conv.center?.name,
      };
    }

    // Customer view communicating with a workshop center or vehicle host:
    const name =
      conv.center?.name ||
      conv.otherParticipant?.fullName?.trim() ||
      conv.otherParticipant?.name?.trim() ||
      (conv.otherParticipant?.email ? conv.otherParticipant.email.split("@")[0] : "") ||
      "Workshop Host";

    const initial = name.charAt(0).toUpperCase();
    const badge = conv.center ? "WORKSHOP" : (conv.otherParticipant?.role || "PARTNER");
    const subtitle = conv.center?.address || conv.otherParticipant?.email || "Service Workshop";

    return {
      title: name,
      initial,
      badge,
      subtitle,
      isCustomerUser: false,
      centerName: conv.center?.name,
    };
  };

  // Filter conversations by search input
  const filteredConversations = conversations.filter((c) => {
    const details = getConversationDetails(c);
    const title = details.title.toLowerCase();
    const subtitle = details.subtitle.toLowerCase();
    const centerName = (c.center?.name || "").toLowerCase();
    const vehicleName = c.rentalBooking?.vehicle ? `${c.rentalBooking.vehicle.make} ${c.rentalBooking.vehicle.model}`.toLowerCase() : "";
    const lastMsg = (c.lastMessage || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    return (
      title.includes(q) ||
      subtitle.includes(q) ||
      centerName.includes(q) ||
      vehicleName.includes(q) ||
      lastMsg.includes(q)
    );
  });

  const activeDetails = activeConversation ? getConversationDetails(activeConversation) : null;

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatRelative = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-130px)] flex flex-col">
      {/* Top Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">
              {portalTitle}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Direct Channels
            </span>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            Communicate directly with vehicle rental hosts and workshop service centers.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card border rounded-2xl flex-1 overflow-hidden flex shadow-sm">
        {/* Left Sidebar: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col bg-card shrink-0 ${showMobileChat ? "hidden md:flex" : "flex"}`}>
          {/* Search box */}
          <div className="p-3.5 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chats, centers, vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/40 text-xs rounded-xl h-10 border-border"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {loadingConversations ? (
              <div className="p-8 text-center text-xs font-semibold text-muted-foreground animate-pulse">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">No Conversations Yet</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                  When you book a vehicle or schedule a workshop service, a direct chat channel will automatically appear right here!
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedId;
                const hasUnread = (c.unreadCount || 0) > 0;
                const details = getConversationDetails(c);

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedId(c.id);
                      setShowMobileChat(true);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors flex gap-3 relative ${
                      isSelected 
                        ? "bg-primary/10 border-l-4 border-primary" 
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm shadow-sm">
                        {details.initial}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1 mb-1">
                        <h4 className="font-bold text-xs truncate text-foreground">{details.title}</h4>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                          {formatRelative(c.lastMessageAt || c.updatedAt)}
                        </span>
                      </div>

                      {/* Associated context pill */}
                      {c.rentalBooking && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1 truncate">
                          <Car className="w-3 h-3 shrink-0" />
                          <span>Rental: {c.rentalBooking.vehicle?.make} {c.rentalBooking.vehicle?.model}</span>
                        </div>
                      )}

                      {c.serviceRequest && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1 truncate">
                          <Wrench className="w-3 h-3 shrink-0" />
                          <span>Service: {c.serviceRequest.serviceName || c.serviceRequest.serviceType}{details.isCustomerUser && c.center ? ` • ${c.center.name}` : ""}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${hasUnread ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                          {c.lastMessage || "Conversation started."}
                        </p>
                        {hasUnread && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Area */}
        <div className={`flex-1 flex flex-col bg-muted/20 ${!showMobileChat ? "hidden md:flex" : "flex"}`}>
          {!activeConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Select a Conversation</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Choose a booking or workshop thread from the left to start sending direct inquiries and messages.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              {activeDetails && (
                <div className="p-3.5 border-b bg-card flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {activeDetails.initial}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">
                          {activeDetails.title}
                        </h3>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {activeDetails.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{activeDetails.subtitle}</span>
                      </p>
                    </div>
                  </div>

                  {/* Booking or Service quick shortcut */}
                  {activeConversation.rentalBooking && (
                    <Link href={isOwnerOrMechanic ? "/owner/dashboard/earnings" : "/dashboard/bookings"}>
                      <Button variant="outline" size="sm" className="text-xs font-bold hidden sm:flex items-center gap-1 rounded-xl h-8">
                        <Car className="w-3.5 h-3.5 text-primary" />
                        <span>Booking #{activeConversation.rentalBooking.id.slice(0, 8)}</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                      </Button>
                    </Link>
                  )}

                  {activeConversation.serviceRequest && (
                    <Link href={isOwnerOrMechanic ? "/owner/dashboard/service-requests" : "/dashboard/service-requests"}>
                      <Button variant="outline" size="sm" className="text-xs font-bold hidden sm:flex items-center gap-1 rounded-xl h-8">
                        <Wrench className="w-3.5 h-3.5 text-primary" />
                        <span>Service Request</span>
                        <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Related Context Banner */}
              {(activeConversation.rentalBooking || activeConversation.serviceRequest) && (
                <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between text-xs text-primary font-medium shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    {activeConversation.rentalBooking && (
                      <span>
                        Rental reservation for <strong>{activeConversation.rentalBooking.vehicle?.make} {activeConversation.rentalBooking.vehicle?.model}</strong> • {new Date(activeConversation.rentalBooking.pickupDate).toLocaleDateString()} to {new Date(activeConversation.rentalBooking.returnDate).toLocaleDateString()}
                      </span>
                    )}
                    {activeConversation.serviceRequest && (
                      <span>
                        Service appointment for <strong>{activeConversation.serviceRequest.serviceName || activeConversation.serviceRequest.serviceType}</strong>
                        {activeDetails?.centerName ? ` at ${activeDetails.centerName}` : ""}
                        {activeConversation.serviceRequest.scheduledDate ? ` • Scheduled on ${new Date(activeConversation.serviceRequest.scheduledDate).toLocaleDateString()}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Message Thread */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
                {loadingMessages ? (
                  <div className="p-8 text-center text-xs font-semibold text-muted-foreground animate-pulse">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">No messages yet</p>
                    <p className="text-[11px] text-muted-foreground">Type a message below to start chatting directly.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-xs md:text-sm leading-relaxed ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-card border border-border text-foreground rounded-bl-none"
                          }`}
                        >
                          {!isMe && (
                            <span className="block text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">
                              {m.sender?.fullName || m.sender?.name || (m.sender?.role === "CUSTOMER" ? "Customer" : (activeConversation.center?.name || "Partner"))}
                            </span>
                          )}
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground px-1">
                          <span>{formatMessageTime(m.createdAt)}</span>
                          {isMe && (
                            m.read ? (
                              <CheckCheck className="w-3 h-3 text-primary" />
                            ) : (
                              <Check className="w-3 h-3 text-muted-foreground" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t bg-card flex gap-2 shrink-0">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={sendMutation.isPending}
                  className="flex-1 bg-muted/40 text-xs rounded-xl h-11 border-border focus:border-primary"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim() || sendMutation.isPending}
                  className="rounded-xl h-11 px-5 font-bold text-xs uppercase tracking-wider gap-1.5 shadow-sm"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
