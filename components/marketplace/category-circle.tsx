import Image from "next/image"

type Props = {
    name: string
    icon: string
}

export default function CategoryCircle({ name, icon }: Props) {
    return (
        <div className="w-28 flex flex-col items-center gap-3 cursor-pointer group">

            <div className="
    w-24 h-24
    rounded-full
    bg-white
    border border-slate-300
    flex items-center justify-center
    shadow-sm
    transition
    duration-200
    group-hover:border-blue-500
    group-hover:bg-blue-50
    group-hover:shadow-md
  ">

                <Image
                    src={icon}
                    alt={name}
                    width={40}
                    height={40}
                />

            </div>

            <span className="
    text-sm
    font-medium
    text-slate-700
    group-hover:text-blue-600
  ">
                {name}
            </span>

        </div>
    )
}