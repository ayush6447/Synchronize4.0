"use client"

import { useState } from "react"
import axios from "axios"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GlassCard } from "@/components/glass-card"
import { Search, AlertCircle, CheckCircle2, Loader2, Sparkles, Clock, ShieldCheck, FileText, ChevronRight, Link as LinkIcon, CheckCircle } from "lucide-react"
import { ethers } from "ethers"
import { useWallet } from "@/context/wallet-context"

interface VerifyResponse {
  approved: boolean
  probability: number
  confidence_bucket: string
  reason: string
  stages: {
    A: string
    B: string
    C: string
  }
  s_max: number
  top_k_matches: Array<{
    title: string
    score: number
    stage: string
  }>
  tags?: string[]
  suggestions?: string[]
  inference_time_seconds?: number
  model_version?: string
  ruleset_version?: string
  index_timestamp?: string
  title: string
}

// Minimal ABI to call registerTitle
const CONTRACT_ABI = [
  "function registerTitle(bytes32 _titleHash) public",
  "function isRegistered(bytes32) public view returns (bool)"
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x60Ceaa19201e1C6C19b5828b4Dd5C450E6148DF9";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const SEPOLIA_CHAIN_ID = process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_ID || '0xaa36a7';

export function VerificationSection() {
  const [title, setTitle] = useState("")
  const [hindiTitle, setHindiTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerifyResponse | null>(null)
  const [error, setError] = useState("")

  // Blockchain State from Context
  const { walletConnected, walletAddress, isConnecting: isConnectingWallet, connectWallet, error: walletError } = useWallet()
  const [txHash, setTxHash] = useState("")
  const [txLoading, setTxLoading] = useState(false)

  const logToBlockchain = async () => {
    if (!(window as any).ethereum || !walletConnected || !result) {
      alert("Please connect your wallet first.")
      return
    }

    const currentChain = await (window as any).ethereum.request({ method: "eth_chainId" })
    if (currentChain !== SEPOLIA_CHAIN_ID) {
      alert(`Please switch MetaMask to Sepolia network.`)
      return
    }

    setTxLoading(true)
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const titleToRegister = result.title
      const titleBytes = ethers.toUtf8Bytes(titleToRegister.toLowerCase().trim())
      const titleHash = ethers.keccak256(titleBytes)

      const tx = await contract.registerTitle(titleHash)
      await tx.wait()
      setTxHash(tx.hash)
    } catch (err: any) {
      console.error(err)
      alert(err.reason || "Transaction failed.")
    } finally {
      setTxLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("English Title is required")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/verify`, {
        title: title.trim(),
        hindi_title: hindiTitle.trim()
      })
      setResult({ ...response.data, title: title.trim() })
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || "Failed to connect to the verification server. Ensure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="verification" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal variant="fade-up" duration={1000}>
          <div className="mb-16 text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Live Title Verification
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Test your title against 160,000+ registered titles instantly.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Input Form Column */}
          <div className="lg:col-span-5">
            <ScrollReveal variant="converge-right" delay={100} duration={800}>
              <GlassCard className="relative overflow-hidden">
                <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: "radial-gradient(circle, rgba(137,152,120,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />

                <form onSubmit={handleVerify} className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-foreground">
                      English Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="w-full rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(18,17,19,0.4)] px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="Enter proposed title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="hindi_title" className="text-sm font-medium text-foreground text-opacity-80">
                      Hindi / Regional Title <span className="text-xs text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      id="hindi_title"
                      type="text"
                      className="w-full rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(18,17,19,0.4)] px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="हिंदी शीर्षक (optional)..."
                      value={hindiTitle}
                      onChange={(e) => setHindiTitle(e.target.value)}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
                          Verify Title
                        </>
                      )}
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(110,231,183,0.1)] to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  </button>
                </form>
              </GlassCard>
            </ScrollReveal>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7">
            {result ? (
              <ScrollReveal variant="converge-left" duration={600}>
                <GlassCard className="h-full relative overflow-hidden flex flex-col gap-6">
                  {/* Status Banner */}
                  <div className={`flex items-center gap-4 rounded-xl p-6 ${result.approved ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                    <div className={`p-3 rounded-full ${result.approved ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/20 text-destructive'}`}>
                      {result.approved ? <CheckCircle2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${result.approved ? 'text-emerald-500' : 'text-destructive'}`}>
                        {result.approved ? 'Title Approved' : 'Title Rejected'}
                      </h3>
                      <p className="text-lg font-medium text-foreground opacity-90 mt-1">{result.reason}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Probability */}
                    <div className="rounded-xl border border-[rgba(16,185,129,0.1)] bg-[rgba(18,17,19,0.3)] p-5">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Uniqueness Score</div>
                      <div className="text-3xl font-bold text-accent">{result.probability.toFixed(1)}%</div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-primary/20 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${result.probability}%`,
                            backgroundColor: result.probability > 75 ? '#10b981' : result.probability > 50 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                    {/* Confidence Bucket */}
                    <div className="rounded-xl border border-[rgba(16,185,129,0.1)] bg-[rgba(18,17,19,0.3)] p-5 flex flex-col justify-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Confidence Bucket</div>
                      <div className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        {result.confidence_bucket}
                      </div>
                    </div>
                  </div>

                  {/* Stages Breakdown */}
                  <div className="rounded-xl border border-[rgba(16,185,129,0.1)] bg-[rgba(18,17,19,0.3)] p-5">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                      <FileText className="h-4 w-4" /> Analysis Stages
                    </h4>
                    <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-primary/20">
                      {Object.entries(result.stages).map(([stage, detail], i) => (
                        <div key={stage} className="relative pl-6">
                          <div className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                          <div className="text-sm border border-[rgba(16,185,129,0.05)] bg-[rgba(16,185,129,0.02)] rounded-md px-3 py-2">
                            <span className="font-semibold text-primary mr-2">Stage {stage}:</span>
                            <span className="text-muted-foreground text-sm">{detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top K Matches & Suggestions */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {result.top_k_matches && result.top_k_matches.length > 0 && (
                      <div className="rounded-xl border border-[rgba(16,185,129,0.1)] bg-[rgba(18,17,19,0.3)] p-5">
                        <div className="text-sm font-medium text-muted-foreground mb-3">Closest Matches</div>
                        <ul className="space-y-2">
                          {result.top_k_matches.map((match, i) => (
                            <li key={i} className="flex items-center justify-between text-sm bg-[rgba(110,231,183,0.02)] border border-[rgba(16,185,129,0.05)] rounded-md px-3 py-2">
                              <span className="text-foreground">{match.title}</span>
                              <span className="text-destructive font-medium">{match.score.toFixed(1)}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="rounded-xl border border-[rgba(16,185,129,0.1)] bg-[rgba(18,17,19,0.3)] p-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                          <Sparkles className="h-4 w-4 text-accent" /> Safe Alternatives
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.suggestions.map((sug, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent border border-accent/20">
                              {sug} <ChevronRight className="h-3 w-3" />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Metadata line */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 pt-4 border-t border-[rgba(16,185,129,0.1)] text-xs text-muted-foreground/60 font-mono">
                    {result.inference_time_seconds && (
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {result.inference_time_seconds.toFixed(3)}s</div>
                    )}
                    {result.model_version && <div>Model: {result.model_version}</div>}
                    {result.ruleset_version && <div>Ruleset: {result.ruleset_version}</div>}
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        Tags: {result.tags.map(t => <span key={t} className="bg-primary/10 text-primary px-1.5 rounded">{t}</span>)}
                      </div>
                    )}
                  </div>

                  {/* Blockchain Registration */}
                  {result.approved && (
                    <div className="mt-4 pt-6 border-t border-[rgba(16,185,129,0.1)]">
                      <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 text-center">
                        <h4 className="text-lg font-bold text-foreground mb-2">Immutable Blockchain Registry</h4>
                        <p className="text-sm text-muted-foreground mb-6">
                          Your title has passed verification. Log an immutable proof-of-approval signature onto the Sepolia Testnet.
                        </p>

                        {!walletConnected ? (
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={connectWallet}
                              disabled={isConnectingWallet}
                              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-all disabled:opacity-50"
                            >
                              {isConnectingWallet ? 'Connecting...' : 'Connect Wallet to Register'}
                            </button>
                            {walletError && <p className="text-xs text-destructive">{walletError}</p>}
                          </div>
                        ) : txHash ? (
                          <div className="bg-emerald-500/10 p-4 rounded-xl flex flex-col items-center justify-center border border-emerald-500/20">
                            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                            <p className="text-emerald-500 font-medium lowercase">Successfully Logged to Blockchain</p>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
                            >
                              View on Etherscan <LinkIcon className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={logToBlockchain}
                            disabled={txLoading}
                            className="inline-flex items-center px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:scale-105 transition-all disabled:opacity-50"
                          >
                            {txLoading ? 'Signing...' : 'Sign & Log Approval Hash'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </ScrollReveal>
            ) : (
              <ScrollReveal variant="scale-in" duration={800} className="h-full">
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.01)] p-8 text-center text-muted-foreground">
                  <div className="mb-4 rounded-full bg-[rgba(18,17,19,0.5)] p-4 shadow-inner border border-[rgba(16,185,129,0.05)]">
                    <ShieldCheck className="h-10 w-10 text-primary/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground opacity-80 mb-2">Awaiting Title Analysis</h3>
                  <p className="max-w-md text-sm">
                    Enter a proposed English title to run it through the PRGI intelligent compliance engine.
                    It will be checked for phonetic, semantic, and ruleset violations.
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
