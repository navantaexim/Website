import { FormLabel } from "@/components/ui/form"

interface RequiredLabelProps {
    children: React.ReactNode
    required?: boolean
}

export function RequiredLabel({ children, required }: RequiredLabelProps) {
    return (
        <FormLabel className="flex items-center gap-1">
            {children}
            {required && <span className="text-red-500">*</span>}
        </FormLabel>
    )
}