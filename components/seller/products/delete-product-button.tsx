'use client'

import { Trash2 } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function DeleteProductButton({ id }: { id: string }) {

    const router = useRouter()

    async function handleDelete() {

        const confirmDelete = confirm("Delete this product?")

        if (!confirmDelete) return

        const res = await fetch(`/api/product/${id}`, {
            method: "DELETE"
        })

        if (res.ok) {
            router.refresh()
        } else {
            alert("Failed to delete product")
        }
    }

    return (
        <DropdownMenuItem
            className="text-destructive"
            onClick={handleDelete}
        >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
        </DropdownMenuItem>
    )
}