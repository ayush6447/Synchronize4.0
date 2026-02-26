"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { ShieldCheck, ShieldAlert, Loader2, Search } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { ScrollReveal } from "@/components/scroll-reveal"
import { useWallet } from "@/context/wallet-context"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x60Ceaa19201e1C6C19b5828b4Dd5C450E6148DF9";
const BLOCKCHAIN_RPC_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const CONTRACT_ABI = [
    "function registerTitle(bytes32 _titleHash) public",
    "function isRegistered(bytes32) public view returns (bool)"
];

export function BlockchainLookup() {
    const [lookupHash, setLookupHash] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<boolean | null>(null)

    const { walletConnected } = useWallet()

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!lookupHash || !lookupHash.startsWith("0x") || lookupHash.length !== 66) {
            alert("Please enter a valid 32-byte Keccak-256 hash (starting with 0x).")
            return
        }

        setLoading(true)
        setResult(null)
        try {
            let provider;
            if (walletConnected && (window as any).ethereum) {
                provider = new ethers.BrowserProvider((window as any).ethereum);
            } else {
                provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            const isRegistered = await contract.isRegistered(lookupHash);
            setResult(isRegistered);
        } catch (err) {
            console.error("Lookup error:", err);
            alert("Failed to query the blockchain network.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="px-6 py-16 bg-primary/5">
            <div className="mx-auto max-w-4xl">
                <ScrollReveal variant="fade-up">
                    <GlassCard className="p-8 border-t-8 border-primary/40">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Public Ledger Verification</h2>
                        <p className="text-muted-foreground mb-8">
                            Auditors and the public can verify if a specific title has been approved and logged into the PRGI smart contract by checking its hash.
                        </p>

                        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                required
                                className="flex-1 rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(18,17,19,0.4)] px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-sm transition-all"
                                placeholder="0x... (Keccak-256 Hash)"
                                value={lookupHash}
                                onChange={(e) => setLookupHash(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Querying...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4" />
                                        Lookup Hash
                                    </>
                                )}
                            </button>
                        </form>

                        {result !== null && (
                            <div className={`mt-8 p-6 rounded-xl flex items-center border animate-in fade-in slide-in-from-top-2 duration-500 ${result ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                {result ? (
                                    <>
                                        <ShieldCheck className="h-8 w-8 mr-4 text-emerald-500" />
                                        <div>
                                            <span className="font-bold text-lg block">Verified Approval</span>
                                            <span className="text-sm opacity-90">This hash exists on the PRGI Blockchain Registry.</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert className="h-8 w-8 mr-4 text-destructive" />
                                        <div>
                                            <span className="font-bold text-lg block">Not Registered</span>
                                            <span className="text-sm opacity-90">This hash has never been registered in our database.</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </ScrollReveal>
            </div>
        </section>
    )
}
