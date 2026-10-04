"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";

const navigationLinks = [
  { href: "/#jee-main", label: "JEE Main" },
  { href: "/#neet", label: "NEET" },
];

const linkStyles =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400";

export default function Navbar() {
  const { user, loading, signOut, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    const { error } = await signOut();
    setSignOutError(error?.message ?? null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 sm:flex-nowrap sm:px-6">
          <Logo />

          {loading ? (
            <span aria-label="Checking account" className="order-2 h-10 w-24 animate-pulse rounded-md bg-slate-800 sm:order-3" />
          ) : user ? (
            <details className="group order-2 relative sm:order-3">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-2 text-sm text-slate-200 transition hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 [&::-webkit-details-marker]:hidden">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold uppercase text-emerald-300">
                  {user.email?.[0] ?? "U"}
                </span>
                <span className="hidden max-w-36 truncate sm:inline">{user.email}</span>
                <ChevronDown aria-hidden="true" className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-slate-800 bg-slate-900 p-2 shadow-xl shadow-black/30">
                <p className="truncate px-3 py-2 text-xs text-slate-400">{user.email}</p>
                {signOutError && <p role="alert" className="px-3 py-2 text-xs text-rose-300">{signOutError}</p>}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </details>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="order-2 inline-flex shrink-0 items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-300/60 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:order-3"
            >
              <LogIn aria-hidden="true" className="h-4 w-4" />
              <span>Sign in</span>
            </button>
          )}

          <nav
            aria-label="Main navigation"
            className="order-3 flex w-full items-center gap-1 border-t border-slate-800/70 py-2 sm:order-2 sm:w-auto sm:border-t-0 sm:py-0"
          >
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkStyles}>
                {link.label}
              </Link>
            ))}
            <Link href="/dashboard" className={`${linkStyles} inline-flex items-center gap-2`}>
              <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
}