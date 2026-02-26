"use client"

import { useEffect, useState } from "react"
import { FileCheck } from "lucide-react"

import { useWallet } from "@/context/wallet-context"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(false)
  const { walletConnected, walletAddress, isConnecting, connectWallet } = useWallet()

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 300)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <nav
      className={`fixed top-4 right-0 left-0 z-40 mx-auto flex max-w-5xl items-center justify-between rounded-full border px-6 py-3 transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        } ${scrolled
          ? "border-[rgba(228,230,195,0.12)] bg-[rgba(18,17,19,0.85)] shadow-lg shadow-[rgba(0,0,0,0.4)] backdrop-blur-xl"
          : "border-[rgba(228,230,195,0.06)] bg-[rgba(18,17,19,0.5)] backdrop-blur-lg"
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <a href="#" className="group flex items-center gap-2" aria-label="TitleGuard home">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-md group-hover:shadow-primary/10">
          <FileCheck className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        <span className="text-3xl font-bold tracking-tight text-foreground">
          TitleGuard
        </span>
      </a>

      <div className="hidden flex-1 items-center justify-center md:flex">
        <div className="flex items-center gap-1 rounded-full bg-[rgba(16,185,129,0.03)] p-1.5 border border-[rgba(16,185,129,0.05)]">
          {[
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How It Works" },
            { href: "#stats", label: "Performance" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative rounded-full px-5 py-2 text-xl font-medium text-muted-foreground transition-all duration-300 hover:bg-[rgba(16,185,129,0.08)] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="flex w-[160px] justify-end">
        {walletConnected ? (
          <div className="group relative flex items-center">
            <div className="flex h-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-mono text-primary shadow-sm transition-all hover:bg-primary/20">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex h-10 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:scale-[1.05] active:scale-[0.98] disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  )
}
