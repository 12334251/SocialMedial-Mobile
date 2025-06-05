// filepath: CustomTailwindProvider.tsx
import React, { PropsWithChildren } from "react";
import { TailwindProvider as OriginalTailwindProvider } from "tailwind-rn";

interface TailwindProps {
  utilities: any;
}

const CustomTailwindProvider: React.FC<PropsWithChildren<TailwindProps>> = ({
  children,
  ...props
}) => {
  return (
    <OriginalTailwindProvider {...props}>{children}</OriginalTailwindProvider>
  );
};

export default CustomTailwindProvider;
