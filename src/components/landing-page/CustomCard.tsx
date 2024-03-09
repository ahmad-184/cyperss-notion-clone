import React from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { cn } from "@/lib/utils";

interface CustomCardProps extends React.ComponentProps<typeof Card> {
  cardHeader?: React.ReactNode;
  cardContent?: React.ReactNode;
  cardFooter?: React.ReactNode;
}

const CustomCard: React.FC<CustomCardProps> = ({
  className,
  cardHeader,
  cardContent,
  cardFooter,
  ...props
}) => {
  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>{cardHeader}</CardHeader>
      <CardContent>{cardContent}</CardContent>
      <CardContent>{cardFooter}</CardContent>
    </Card>
  );
};

export default CustomCard;
