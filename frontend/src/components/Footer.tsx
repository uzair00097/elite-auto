"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FeedbackModal from "@/components/FeedbackModal";

export default function Footer() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <footer className="relative overflow-hidden bg-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <Image src="/logo-dark.png" alt="Elite Auto" width={880} height={176} className="h-6 w-auto" />
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              The smartest way to buy and sell used vehicles in Pakistan — natural language search, verified
              sellers, no middlemen.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Marketplace</h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/" className="text-slate-300 transition hover:text-white">
                Browse listings
              </Link>
              <Link href="/sell" className="text-slate-300 transition hover:text-white">
                Sell a vehicle
              </Link>
              <Link href="/dashboard" className="text-slate-300 transition hover:text-white">
                My listings
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project</h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm">
              <a
                href="https://github.com/uzair00097/elite-auto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 transition hover:text-white"
              >
                Source on GitHub
              </a>
              <a
                href="https://github.com/uzair00097/elite-auto#known-limitations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 transition hover:text-white"
              >
                Known limitations
              </a>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Feedback</h3>
            <p className="mt-3 text-sm text-slate-400">Found a bug, or want a feature?</p>
            <button
              onClick={() => setFeedbackOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-white/20 active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.35 0-2.63-.26-3.78-.72L3 20l1.05-3.16A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Send feedback
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Muhammad Uzair. All rights reserved.</p>
          <a
            href="https://github.com/uzair00097"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-300"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.17-3.08-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.18a10.9 10.9 0 015.72 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.57.23 2.73.11 3.02.73.8 1.17 1.83 1.17 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .3.2.66.79.55A10.52 10.52 0 0023.5 12C23.5 5.73 18.27.5 12 .5z" />
            </svg>
            github.com/uzair00097
          </a>
        </div>
      </div>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </footer>
  );
}
