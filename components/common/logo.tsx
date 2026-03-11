import Image from "next/image"
import Link from "next/link"

export default function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2">

            <Image
                src="/logo.png"
                alt="Navanta Exim"
                width={32}
                height={32}
                priority
            />

            <span className="font-semibold text-lg text-slate-900">
                Navanta Exim
            </span>

        </Link>
    )
}