"use client";

import { Suspense } from "react";
import { ChatView } from "@/components/modules/chat/ChatView";

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatView basePath="/dashboard/messages" portalTitle="Customer Inquiries & Messages" />
    </Suspense>
  );
}
