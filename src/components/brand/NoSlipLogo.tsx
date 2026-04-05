import Image from "next/image";

import { cn } from "@/lib/cn";

type NoSlipLogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function NoSlipLogo({ className, iconOnly = false }: NoSlipLogoProps) {
  if (iconOnly) {
    return (
      <Image
        src="/icon.svg"
        alt=""
        width={32}
        height={32}
        className={cn("h-8 w-8", className)}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src="/logo.svg"
      alt="NoSlip"
      width={220}
      height={48}
      className={cn("h-8 w-auto", className)}
      priority
    />
  );
}
