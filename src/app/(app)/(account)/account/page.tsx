import type { Metadata } from 'next'

import { AccountForm } from '@/components/forms/AccountForm'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

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
              <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-black transition peer-checked:translate-x-5" />
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
              <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-black transition peer-checked:translate-x-5" />
            </label>
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