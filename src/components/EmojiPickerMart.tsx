"use client";

import { useTheme } from "next-themes";
import { memo, useMemo, useState } from "react";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@mantine/hooks";
import ClientPortal from "./ClientPortal";

interface EmojiPickerProps {
  onChangeEmoji: (emoji: string) => void;
  emoji: string;
  classNames?: string;
}

const EmojiPickerReact: React.FC<EmojiPickerProps> = ({
  classNames,
  emoji,
  onChangeEmoji,
}) => {
  const { theme, systemTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const t = useMemo(() => theme || systemTheme, [theme]);

  const onClickEmoji = (e: any) => {
    onChangeEmoji(e.native);
    setOpen(false);
  };

  const wrapperRef = useClickOutside(() => {
    setOpen(false);
  });

  return (
    <div>
      <p
        className={cn(`cursor-pointer`, classNames)}
        onClick={() => setOpen(true)}
      >
        {emoji}
      </p>
      <ClientPortal show selector="mart-emoji-picker">
        <div
          className={cn(
            "fixed z-[500] inset w-full h-full left-0 top-0 bottom-0 right-0",
            {
              hidden: !open,
              "flex visible": open,
            }
          )}
        >
          <div className="flex items-center z-[501] justify-center w-full h-full">
            <div className="w-fit h-fit" ref={wrapperRef}>
              <Picker
                emojiSize={24}
                data={data || []}
                onEmojiSelect={onClickEmoji}
                locale="en"
                noCountryFlags={false}
                onClickOutside={() => {
                  if (open) setOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      </ClientPortal>
    </div>
  );
};

export default memo(EmojiPickerReact);
