import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";

interface BannerProps {
  src: string | null;
  alt: string | null;
  isUploading: boolean;
}

const Banner: React.FC<BannerProps> = ({ src, alt, isUploading }) => {
  const [loaded, setLoaded] = useState(true);
  const [error, setError] = useState(false);

  const imgSrc = useMemo(() => src, [src]);

  return (
    <div className="pl-[1px] z-[-1]">
      {imgSrc ? (
        <div className={cn("h-[200px] relative w-full z-[0]")}>
          {!error ? (
            <>
              <div
                className={cn(
                  "w-full h-full absolute bg-muted animate-pulse inset-0 z-[2]",
                  {
                    "hidden text-nowrap": !isUploading,
                    "block visible": isUploading,
                  }
                )}
              ></div>
              <Image
                src={imgSrc || ""}
                className={cn(
                  "hidden invisible w-full h-full inset-0 object-cover bg-center z-[0]",
                  {
                    "block visible": loaded,
                  }
                )}
                fill
                alt={alt || "banner"}
                loading="lazy"
                onLoad={() => {
                  setLoaded(true);
                }}
              />
            </>
          ) : (
            <>
              <div
                className={cn(
                  "flex dark:text-muted/50 text-muted-foreground/15 text-7xl font-bold items-center justify-center text-center h-[250px] relative w-full"
                )}
              >
                Error
                <div className="absolute w-full h-full inset-0 bg-muted no-image-bg"></div>
              </div>
            </>
          )}
        </div>
      ) : isUploading && !imgSrc ? (
        <div className={cn("h-[200px] relative w-full z-[0]")}>
          <div
            className={cn(
              "w-full h-full absolute bg-muted animate-pulse inset-0 z-[2]",
              {
                "hidden text-nowrap": !isUploading,
                "block visible": isUploading,
              }
            )}
          ></div>
        </div>
      ) : null}
    </div>
  );
};

export default Banner;
