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
    <Link href={href} onClick={onClick} className="group relative py-1 text-sm font-medium">
      <span className={`transition ${isActive ? "text-blue-700" : "text-slate-600 group-hover:text-slate-900"}`}>
        {children}
      </span>
      <span
        className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-blue-700 transition-all duration-300 ease-out ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

function Avatar({ name, verified }: { name: string; verified: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 ring-2 ${
        verified ? "ring-emerald-400" : "ring-white"
      }`}
      title={verified ? `${name} · verified` : name}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-30 border-b bg-white/90 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "border-slate-200 shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center transition hover:opacity-80 active:scale-[0.98]">
          <Image src="/logo.png" alt="Elite Auto" width={880} height={176} priority className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Browse</NavLink>
          {!loading && user && (
            <>
              <NavLink href="/dashboard">My Listings</NavLink>
              <div className="hidden items-center gap-2 lg:flex">
                <Avatar name={user.name} verified={user.phone_verified} />
                <span className="max-w-[9rem] truncate text-sm font-medium text-slate-700">{user.name}</span>
              </div>
              <button onClick={logout} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Log out
              </button>
              <Link
                href="/sell"
                className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
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
                className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 active:scale-[0.95] md:hidden"
        >
          <svg
            className={`h-5 w-5 transition-transform duration-300 ${menuOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
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

      <div
        className={`grid overflow-hidden border-slate-200 bg-white transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "grid-rows-[1fr] border-t opacity-100" : "grid-rows-[0fr] border-t-0 opacity-0"
        }`}
      >
        <nav className="flex min-h-0 flex-col gap-1 px-4 py-3">
          <NavLink href="/" onClick={closeMenu}>
            Browse
          </NavLink>
          {!loading && user && (
            <>
              <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-3">
                <Avatar name={user.name} verified={user.phone_verified} />
                <span className="truncate text-sm font-medium text-slate-700">{user.name}</span>
              </div>
              <div className="py-2">
                <NavLink href="/dashboard" onClick={closeMenu}>
                  My Listings
                </NavLink>
              </div>
              <Link
                href="/sell"
                onClick={closeMenu}
                className="mt-1 rounded-full bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
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
                className="mt-1 rounded-full bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
