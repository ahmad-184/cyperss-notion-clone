import { cn } from "@/lib/utils";
import Image from "next/image";

interface BannerProps {
  src: string | null;
}

const Banner: React.FC<BannerProps> = ({ src }) => {
  if (!src) return null;

  return (
    <>
      {src ? (
        <div className={cn("h-[230px] relative w-full")}>
          <Image
            src={src}
            fill
            className={cn("w-full h-full absolute inset-0 object-cover z-10")}
            alt={`banner`}
            blurDataURL="/blur-bg"
            placeholder="blur"
          />
        </div>
      ) : null}
    </>
  );
};

export default Banner;
