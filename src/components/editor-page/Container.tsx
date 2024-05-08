import { cn } from "@/lib/utils";

interface ContaienrProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Container: React.FC<ContaienrProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("py-6 px-6 w-full", className)} {...props}>
      <div className="w-full max-w-3xl flex flex-col gap-2">{children}</div>
    </div>
  );
};

export default Container;
