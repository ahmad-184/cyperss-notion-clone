import Image from "next/image";
import Logo from "@/assets/cypresslogo.svg";

interface CypressLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const CypressLogo: React.FC<CypressLogoProps> = ({
  className,
  width,
  height,
}) => {
  return (
    <Image
      alt="Cypress logo"
      src={Logo}
      width={width || 25}
      height={height || 25}
      className={className}
    />
  );
};

export default CypressLogo;
