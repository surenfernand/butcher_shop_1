import Link from 'next/link'
import React from 'react'

export const MonthlyMenuPromo: React.FC = () => {
  return (
    <section className=" ">
      <div className="grid min-h-[260px] overflow-hidden border border-[#3b3422] bg-[#111] md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex items-end p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(212,166,60,0.18),transparent_40%),linear-gradient(120deg,#2a2112_0%,#16110b_35%,#0f0f0f_100%)]" />
          <div className="absolute inset-0 opacity-25 mix-blend-screen [background-image:repeating-linear-gradient(135deg,transparent,transparent_16px,rgba(255,255,255,0.07)_17px,transparent_18px)]" />

          <div className="relative z-10">
            <p className="text-4xl font-bold uppercase leading-none tracking-[0.08em] text-white md:text-6xl">
              Butcher&apos;s Selection
            </p>
            <p className="mt-2 text-base font-semibold text-[#d4a63c] md:text-lg">Chef&apos;s Monthly Offer</p>
          </div>
        </div>

        <div className="relative flex flex-col justify-center px-8 py-10 text-center md:px-10">
          <div className="absolute inset-0 bg-[#151719]" />
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_8%_10%,#d4a63c_1px,transparent_1px)] [background-size:38px_38px]" />

          <div className="relative z-10">
            <h3 className="text-lg font-bold uppercase leading-tight tracking-[0.03em] text-[#d4a63c] md:text-3xl">
              Exceptional Cuts At A Special Monthly Price
            </h3>

            <div className="mt-5 space-y-1 text-white">
             
              <p className="text-base font-semibold text-[#d4a63c] md:text-2xl">
                Exclusive price available this month
              </p>
            </div>

            <p className="mx-auto mt-6 max-w-[520px] text-xs leading-relaxed text-white/75 md:text-sm">
              Every box is hand-prepared to order to ensure peak freshness and quality.
            </p>

            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-white/75">Limited monthly availability</p>

            <Link
              href="/shop"
              className="mt-3 inline-flex items-center justify-center border border-[#d4a63c] bg-[#d4a63c] px-7 py-2 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:brightness-110"
            >
              Shop Offer
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
