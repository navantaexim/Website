"use client"

import { useState } from "react"

export default function RFQModal() {

    const [open, setOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full bg-primary text-white py-3 rounded-lg"
            >
                Request Quote
            </button>

            {open && (

                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white p-6 rounded-xl w-[420px]">

                        <h3 className="text-lg font-semibold">
                            Request Quote
                        </h3>

                        <input
                            placeholder="Quantity"
                            className="border w-full mt-4 px-3 py-2 rounded"
                        />

                        <textarea
                            placeholder="Message"
                            className="border w-full mt-3 px-3 py-2 rounded"
                        />

                        <div className="flex justify-end gap-3 mt-4">

                            <button
                                onClick={() => setOpen(false)}
                                className="border px-4 py-2 rounded"
                            >
                                Cancel
                            </button>

                            <button className="bg-primary text-white px-4 py-2 rounded">
                                Send
                            </button>

                        </div>

                    </div>

                </div>

            )}
        </>
    )
}