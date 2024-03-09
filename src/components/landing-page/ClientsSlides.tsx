import { CLIENTS } from "@/constants";
import Image from "next/image";

const ClientsSlides = () => {
  return (
    <div
      className="my-4 relative overflow-hidden flex after:content[''] after:dark:from-black after:to-transparent after:from-background after:bg-gradient-to-l after:bottom-0 after:top-0 after:right-0 after:w-20 after:z-10 after:absolute 
        before:content[''] before:dark:from-black before:to-transparent before:from-background before:bg-gradient-to-r before:bottom-0 before:left-0 before:w-20 before:z-10 before:top-0 before:absolute
      "
    >
      {[...Array(2)].map((arr) => (
        <div key={arr} className="flex flex-nowrap animate-slide">
          {CLIENTS.map((client) => (
            <div
              className="relative w-[180px] m-20 shrink-0 flex items-center"
              key={client.alt + " slide"}
            >
              <Image
                src={client.logo}
                alt={client.alt}
                width={180}
                className="object-contain max-w-none"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ClientsSlides;
