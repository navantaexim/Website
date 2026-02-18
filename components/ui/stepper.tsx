'use client'

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  id: string | number
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number // 0-indexed
  className?: string
  onStepClick?: (stepIndex: number) => void
}

export function Stepper({ steps, currentStep, className, onStepClick }: StepperProps) {
  return (
    <div className={cn("flex flex-col space-y-0", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div 
            key={step.id} 
            className={cn(
                "relative flex gap-4 pl-2", 
                isLast ? "pb-0" : "pb-8"
            )}
          >
             {/* Connecting Line */}
             {!isLast && (
                <div 
                  className={cn(
                    "absolute left-[19px] top-8 bottom-0 w-px transition-colors duration-200", 
                    isCompleted ? "bg-green-600" : "bg-border"
                  )} 
                />
             )}

            {/* Step Indicator */}
            <div 
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                isCompleted 
                    ? "bg-green-600 border-green-600 text-white" 
                    : isCurrent 
                        ? "border-primary bg-background ring-4 ring-primary/10 text-primary" 
                        : "border-muted-foreground/30 bg-muted text-muted-foreground"
              )}
            >
                {isCompleted ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                )}
            </div>

            {/* Step Content */}
            <div className="flex flex-col pt-1">
               <button 
                type="button"
                disabled={!onStepClick} 
                className={cn(
                    "text-left text-sm font-medium leading-none transition-colors", 
                    isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground",
                    onStepClick && "hover:text-primary"
                )}
                onClick={() => onStepClick?.(index)}
               >
                 {step.title}
               </button>
               {step.description && (
                  <span className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </span>
               )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
