import Link from "next/link"
import Image from "next/image"

export default function Logo() {
    return (
        <Link
            href="/"
            className="flex items-center gap-2"
        >
            <Image
                src="/logo.png"
                alt="logo"
                width={36}
                height={36}
                priority
            />

            <span className="text-lg font-semibold text-slate-800">
                Navanta Exim
            </span>

        </Link>
    )
}