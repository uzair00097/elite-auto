import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Image src="/logo.png" alt="Elite Auto" width={880} height={176} className="h-6 w-auto opacity-80" />
        <p className="text-center text-xs text-slate-500 sm:text-left">
          © {new Date().getFullYear()} Muhammad Uzair. All rights reserved.
        </p>
        <nav className="flex gap-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            Browse
          </Link>
          <Link href="/sell" className="hover:text-slate-700">
            Sell
          </Link>
        </nav>
      </div>
    </footer>
  );
}
