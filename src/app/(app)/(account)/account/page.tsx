import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { AccountForm } from '@/components/forms/AccountForm'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account settings.')}`,
    )
  }

  return (
    <div className="space-y-14 text-white mt-5">      
      <div>
        <h1 className="text-5xl font-bold tracking-tight">
         Account Settings
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-white/60">
         Manage your atelier experience, security protocols, and artisanal fulfillment
          preferences.
        </p>
      </div>

      {/* SECURITY */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-[#E2B84F]">
          Security
        </h2>

        <div className="border border-[#3A3325] bg-[#1A1C1C] p-8">
          <AccountForm />
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-[#E2B84F]">
          Notifications
        </h2>

        <div className="border border-[#3A3325] bg-[#1A1C1C]">
          <div className="flex items-center justify-between px-8 py-8">
            <div>
              <h3 className="font-semibold text-white">Email Preferences</h3>
              <p className="mt-1 text-sm text-white/60">
                Receive artisanal updates and order confirmations.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="emailNotifications"
                defaultChecked
                className="peer sr-only"
              />
              <span className="h-5 w-10 rounded-full bg-[#2B2D2E] border border-white/30 transition peer-checked:border-[#E2B84F] peer-checked:bg-[#E2B84F]" />
              <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex items-center justify-between px-8 py-8">
            <div>
              <h3 className="font-semibold text-white">SMS Notifications</h3>
              <p className="mt-1 text-sm text-white/60">
                Real-time alerts for when your cut is ready for fulfillment.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="smsNotifications"
                className="peer sr-only"
              />
              <span className="h-5 w-10 rounded-full bg-[#2B2D2E] border border-white/30 transition peer-checked:border-[#E2B84F] peer-checked:bg-[#E2B84F]" />
              <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
        </div>
      </section>

      {/* PREFERRED FULFILLMENT */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-wide text-[#E2B84F]">
          Preferred Fulfillment
        </h2>

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="min-h-[180px] bg-[#1A1C1C] border border-[#3A3325] overflow-hidden">
            <div className="h-full min-h-[180px] bg-[linear-gradient(135deg,rgba(226,184,79,0.25),rgba(0,0,0,0.75)),url('/media/shop-interior.jpg')] bg-cover bg-center" />
          </div>

          <div className="border border-[#3A3325] bg-[#1A1C1C] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E2B84F]">
              Default Selection
            </p>

            <h3 className="mt-3 text-2xl font-semibold">
              {user?.defaultFulfillmentLocation?.title || 'Pickup Location'}
            </h3>

            <p className="mt-2 text-sm text-white/60">
              {user?.defaultFulfillmentLocation?.address || 'No preferred fulfillment location selected.'}
            </p>

            <div className="mt-10 border-t border-white/10 pt-6 flex justify-end gap-8">
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-white/55 hover:text-white">
                Change Location
              </button>

              <button className="text-xs font-bold uppercase tracking-[0.2em] text-[#E2B84F] hover:text-[#F3CA66]">
                View Hours
              </button>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}