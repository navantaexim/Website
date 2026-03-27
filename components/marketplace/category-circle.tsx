import Image from "next/image"

type Props = {
    name: string
    icon: string
}

export default function CategoryCircle({ name, icon }: Props) {

    return (
        <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] group cursor-pointer">

            <div className="
                w-14 h-14 sm:w-16 sm:h-16
                rounded-full
                bg-slate-50
                border border-slate-200
                flex items-center justify-center
                transition-all duration-200
                group-hover:border-blue-500
                group-hover:bg-blue-50
            ">

                <Image
                    src={icon}
                    alt={name}
                    width={24}
                    height={24}
                    className="opacity-80 group-hover:opacity-100"
                />

            </div>

            <span className="
                text-[10px] sm:text-[11px]
                text-center
                mt-1.5 sm:mt-2
                text-slate-600
                leading-tight
                line-clamp-2
                group-hover:text-blue-600
            ">
                {name}
            </span>

        </div>
    )
}