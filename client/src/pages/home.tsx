import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus } from "lucide-react";
import ChatThread from "@/components/chat-thread";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";

export default function Home() {
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const { data: conversation } = useQuery<Conversation>({
    queryKey: [`/api/conversations/${conversationId}`],
    enabled: !!conversationId,
  });

  const createConversation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest("POST", "/api/conversations");
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Create conversation error:", error);
        throw new Error("대화를 시작할 수 없습니다.");
      }
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) {
        throw new Error("대화를 먼저 시작해주세요.");
      }

      const messageData: Message = {
        role: "user",
        content: message,
      };

      try {
        const res = await apiRequest(
          "POST",
          `/api/conversations/${conversationId}/messages`,
          { message: messageData }
        );
        return res.json();
      } catch (error) {
        console.error("Send message error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setPrompt("");
      queryClient.invalidateQueries({
        queryKey: [`/api/conversations/${conversationId}`],
      });
    },
    onError: (error: Error) => {
      console.error("Send message error:", error);
      toast({
        variant: "destructive",
        title: "메시지 전송 실패",
        description: error.message || "메시지 전송에 실패했습니다. 다시 시도해주세요.",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      if (!conversationId) {
        const newConversation = await createConversation.mutateAsync();
        setConversationId(newConversation.id);
        // Wait a bit for the state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await sendMessage.mutateAsync(prompt);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">AI Image Generator</h1>
            <p className="text-muted-foreground">
              Describe the image you want to create and let AI help you generate it.
            </p>
          </div>

          {conversation?.messages && (
            <ChatThread 
              messages={conversation.messages}
              isPending={sendMessage.isPending}
            />
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="이미지를 생성하기 위한 설명을 입력하세요..."
                disabled={sendMessage.isPending || createConversation.isPending}
              />
              <Button 
                type="submit"
                disabled={!prompt.trim() || sendMessage.isPending || createConversation.isPending}
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                전송
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}