'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const images = ['/scroll1.jpg', '/scroll2.jpg', '/scroll3.jpg', '/scroll4.jpg']

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* IMAGE WRAPPER */}
      <div className="w-[380px] h-[380px] md:w-[420px] md:h-[420px] overflow-hidden rounded-2xl shadow-xl bg-white mx-auto relative">
        <Image
          src={images[index]}
          alt="carousel"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 380px, 420px"
        />
      </div>

      {/* TAGLINE */}
      <p className="mt-4 text-center w-[380px] md:w-[420px] text-primary font-semibold tracking-wide">
        New opportunities unlocked
      </p>
    </div>
  )
}
