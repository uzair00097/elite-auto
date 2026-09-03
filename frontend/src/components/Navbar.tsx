"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm font-medium transition ${
        isActive ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Elite Auto" width={880} height={176} priority className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Browse</NavLink>
          {!loading && user && (
            <>
              <NavLink href="/dashboard">My Listings</NavLink>
              <button onClick={logout} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Log out
              </button>
              <Link
                href="/sell"
                className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                + Sell a Vehicle
              </Link>
            </>
          )}
          {!loading && !user && (
            <>
              <NavLink href="/login">Log in</NavLink>
              <Link
                href="/register"
                className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {!loading && user && !user.phone_verified && pathname !== "/verify-phone" && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 sm:px-6">
          Your phone isn&apos;t verified yet.{" "}
          <Link href="/verify-phone" className="font-medium underline underline-offset-2">
            Verify now
          </Link>
        </div>
      )}

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <NavLink href="/" onClick={closeMenu}>
            Browse
          </NavLink>
          {!loading && user && (
            <>
              <div className="py-2">
                <NavLink href="/dashboard" onClick={closeMenu}>
                  My Listings
                </NavLink>
              </div>
              <Link
                href="/sell"
                onClick={closeMenu}
                className="mt-1 rounded-full bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm"
              >
                + Sell a Vehicle
              </Link>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="mt-2 py-2 text-left text-sm font-medium text-slate-600"
              >
                Log out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <div className="py-2">
                <NavLink href="/login" onClick={closeMenu}>
                  Log in
                </NavLink>
              </div>
              <Link
                href="/register"
                onClick={closeMenu}
                className="mt-1 rounded-full bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
