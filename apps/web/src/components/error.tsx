import { cn } from "@/lib/utils";
import type React from "react";

export const Error = ({
  message,
  className,
  children,
}: {
  className?: string;
  message: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={cn(`text-destructive`, className)}>
      {children ? children : message}
    </div>
  );
};
