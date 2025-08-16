import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

const TrackingProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: "default" | "success" | "warning"
    showPercentage?: boolean
  }
>(({ className, value, variant = "default", showPercentage = true, ...props }, ref) => {
  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return "bg-accent"
      case "warning":
        return "bg-status-warning"
      default:
        return "bg-primary"
    }
  }

  return (
    <div className="space-y-2">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-secondary shadow-inner",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-1000 ease-out rounded-full",
            getProgressColor()
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <div className="flex justify-end">
          <span className="text-sm font-medium text-muted-foreground">
            {value || 0}%
          </span>
        </div>
      )}
    </div>
  )
})
TrackingProgress.displayName = "TrackingProgress"

export { Progress, TrackingProgress }
