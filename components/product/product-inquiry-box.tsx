"use client"

import { useState } from "react"

export default function InquiryBox({
    productId,
    sellerName
}: {
    productId: string
    sellerName: string
}) {

    const [message, setMessage] = useState("")
    const [quantity, setQuantity] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {

        if (!message) {
            alert("Please enter your requirement")
            return
        }

        setLoading(true)

        try {

            await fetch("/api/inquiries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productId,
                    message,
                    quantity
                })
            })

            alert("Inquiry sent successfully")
            setMessage("")
            setQuantity("")

        } catch (error) {

            console.error(error)
            alert("Failed to send inquiry")

        }

        setLoading(false)
    }

    return (
        <div className="sticky top-24 border rounded-xl p-6 bg-white shadow-sm">

            <h3 className="text-lg font-semibold mb-3">
                Send Inquiry
            </h3>

            <p className="text-sm text-slate-500 mb-4">
                Contact <span className="font-medium">{sellerName}</span> for pricing, MOQ and lead time.
            </p>

            {/* Quantity */}
            <input
                type="text"
                placeholder="Required Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm mb-3"
            />

            {/* Requirement */}
            <textarea
                rows={4}
                placeholder="Describe your requirement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm mb-4"
            />

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
            >
                {loading ? "Sending..." : "Send Inquiry"}
            </button>

            <p className="text-xs text-slate-400 mt-3 text-center">
                Suppliers typically respond within 24 hours
            </p>

        </div>
    )
}