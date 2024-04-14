import type { EmojiClickData, Theme } from "emoji-picker-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/Dialog";
import { cn } from "@/lib/utils";

const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

interface EmojiPickerProps {
  handleChangeEmoji(e: EmojiClickData): void;
  emoji: string;
  classNames?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  handleChangeEmoji,
  classNames,
  emoji,
}) => {
  const { theme, systemTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const t = useMemo(() => theme || systemTheme, [theme]);

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        if (!e) setOpen(e);
      }}
    >
      <DialogTrigger asChild onClick={() => setOpen((prev) => !prev)}>
        <p className={cn(`cursor-pointer`, classNames)}>{emoji}</p>
      </DialogTrigger>
      <DialogContent className="py-5 bg-transparent border-none">
        <Picker
          onEmojiClick={(e) => {
            handleChangeEmoji(e);
            setOpen(false);
          }}
          theme={t as Theme}
          lazyLoadEmojis
          style={{
            maxHeight: "600px",
          }}
          width={"100%"}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmojiPicker;
