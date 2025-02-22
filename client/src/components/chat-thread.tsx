import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import ImagePreview from "./image-preview";
import type { Message } from "@shared/schema";

interface ChatThreadProps {
  messages: Message[];
  isPending: boolean;
}

export default function ChatThread({ messages, isPending }: ChatThreadProps) {
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {messages.map((message, i) => (
          <Card
            key={i}
            className={`p-4 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                </p>
                <p className="text-sm">{message.content}</p>
                {message.role === "function" && message.name === "generate_image" && (
                  <div className="mt-4">
                    {(() => {
                      try {
                        const { imagePath } = JSON.parse(message.content);
                        return (
                          <ImagePreview
                            src={imagePath}
                            alt="Generated image"
                            className="mt-4"
                          />
                        );
                      } catch (error) {
                        console.error("Failed to parse image content:", error);
                        return <p className="text-red-500">Failed to load image</p>;
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {isPending && (
          <Card className="p-4 bg-muted">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}