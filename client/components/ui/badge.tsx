// import * as React from "react";
// import { cva, type VariantProps } from "class-variance-authority";
// import { cn } from "@/lib/utils";

// const badgeVariants = cva(
//   "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
//   {
//     variants: {
//       variant: {
//         default: "border-transparent bg-primary text-primary-foreground",
//         secondary: "border-transparent bg-secondary text-secondary-foreground",
//         destructive: "border-transparent bg-destructive text-destructive-foreground",
//         outline: "text-foreground",
//         success: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
//         warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
//         info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//     },
//   }
// );

// export interface BadgeProps
//   extends React.HTMLAttributes<HTMLDivElement>,
//     VariantProps<typeof badgeVariants> {}

// function Badge({ className, variant, ...props }: BadgeProps) {
//   return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
// }

// export { Badge, badgeVariants };



import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:text-destructive-foreground",
        outline: "text-foreground",
        // Semantic variants for the Admin Dashboard
        success: 
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/15",
        warning: 
          "border-transparent bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/15",
        info: 
          "border-transparent bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return (
    <div
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }