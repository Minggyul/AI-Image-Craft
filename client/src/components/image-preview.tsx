import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  return (
    <Card className={className}>
      <AspectRatio ratio={1}>
        <img
          src={src}
          alt={alt}
          className="rounded-md object-cover w-full h-full"
        />
      </AspectRatio>
    </Card>
  );
}
