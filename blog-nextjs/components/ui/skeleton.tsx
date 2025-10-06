import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes&lt;HTMLDivElement&gt;) {
  return (
    &lt;div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    /&gt;
  )
}

export { Skeleton }