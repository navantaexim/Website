import Image from "next/image"

type Props = {
    name: string
    icon: string
}

export default function CategoryCircle({ name, icon }: Props) {
    return (
        <div className="flex flex-col items-center gap-2 cursor-pointer group">

            <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md group-hover:border-blue-500 transition">

                <Image
                    src={icon}
                    alt={name}
                    width={28}
                    height={28}
                />

            </div>

            <span className="text-sm text-slate-700 group-hover:text-blue-700 transition">
                {name}
            </span>

        </div>
    )
}