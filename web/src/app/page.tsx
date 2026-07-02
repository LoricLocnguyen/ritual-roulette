"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { WalletConnect } from "@/components/WalletConnect";
import { CreateBountyForm } from "@/components/CreateBountyForm";
import { LoadBountyPanel } from "@/components/LoadBountyPanel";
import { BountyView } from "@/components/BountyView";
import { useRecentBounties } from "@/hooks/useRecentBounties";
import { isContractConfigured, contractAddress } from "@/config/contract";
import { ritualChain } from "@/config/wagmi";
import { shortenAddress } from "@/lib/format";
import { Notice } from "@/components/ui";

// Ritual Roulette components & hooks
import { useDailySpin, DApp } from "@/hooks/useDailySpin";
import { SpinWheel } from "@/components/SpinWheel";
import { DAppAnalysisCard } from "@/components/DAppAnalysisCard";
import { CollectionPanel } from "@/components/CollectionPanel";

type ActiveTab = "spin" | "collection" | "bounty";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("spin");
  const [selectedId, setSelectedId] = useState<bigint | null>(null);
  const [lastSpunDApp, setLastSpunDApp] = useState<DApp | null>(null);
  const [prePickedWinner, setPrePickedWinner] = useState<DApp | null>(null);

  // Wagmi wallet hooks
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const wrongChain = isConnected && chainId !== ritualChain.id;

  // Load hooks
  const { ids, add } = useRecentBounties();
  const {
    canSpin,
    history,
    streak,
    collection,
    badges,
    executeSpin,
    pickDailyDApp,
    allDApps,
    activeDApps,
  } = useDailySpin();

  // Track any opened bounty in the recent list too.
  useEffect(() => {
    if (selectedId !== null) add(selectedId);
  }, [selectedId, add]);

  const handleCreated = useCallback(
    (id: bigint) => {
      add(id);
      setSelectedId(id);
    },
    [add],
  );

  // Pre-pick today's winner once activeDApps are loaded and user can spin
  useEffect(() => {
    if (canSpin && activeDApps.length > 0 && !prePickedWinner) {
      setPrePickedWinner(pickDailyDApp());
    }
    // Reset pre-pick when user can no longer spin (already spun today)
    if (!canSpin) {
      setPrePickedWinner(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSpin, activeDApps.length]);

  // Spin complete handler — wheel passes its visual winner, we record that exact dApp
  const handleSpinComplete = (dapp: DApp) => {
    const spunResult = executeSpin(dapp);
    setLastSpunDApp(spunResult);
    setPrePickedWinner(null); // clear until next eligible day
  };

  // Find the details of the most recently spun dApp from history to show on mount if any
  useEffect(() => {
    if (history.length > 0 && !lastSpunDApp) {
      const lastRecord = history[history.length - 1];
      const found = allDApps.find((d) => d.id === lastRecord.dappId);
      if (found) setLastSpunDApp(found);
    }
  }, [history, allDApps, lastSpunDApp]);

  return (
    <div className="min-h-full flex flex-col justify-between">
      <div>
        {/* Sticky top navigation */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            
            {/* Logo/Icon */}
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-emerald-400 text-base font-extrabold text-zinc-950 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                🌀
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">
                  Ritual Roulette
                </h1>
                <p className="text-[10px] leading-tight text-zinc-400 font-mono">
                  Daily Testnet Portal · {ritualChain.name}
                </p>
              </div>
            </div>

            {/* Menu Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 rounded-lg bg-zinc-900/80 p-1 border border-white/5">
              <button
                onClick={() => setActiveTab("spin")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold select-none transition-all ${
                  activeTab === "spin"
                    ? "bg-indigo-500 text-zinc-950 shadow-md font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                🎰 Spin Daily
              </button>
              <button
                onClick={() => setActiveTab("collection")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold select-none transition-all ${
                  activeTab === "collection"
                    ? "bg-indigo-500 text-zinc-950 shadow-md font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                🏆 Vault & Collection
              </button>
              <button
                onClick={() => setActiveTab("bounty")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold select-none transition-all ${
                  activeTab === "bounty"
                    ? "bg-indigo-500 text-zinc-950 shadow-md font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                ⚖️ AI Bounty Judge
              </button>
            </nav>

            <WalletConnect />
          </div>
        </header>

        {/* Small screen navigation tabs */}
        <div className="flex border-b border-white/5 bg-zinc-950 md:hidden">
          <button
            onClick={() => setActiveTab("spin")}
            className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === "spin" ? "border-indigo-400 text-indigo-400 bg-white/5" : "border-transparent text-zinc-500"
            }`}
          >
            🎰 Spin
          </button>
          <button
            onClick={() => setActiveTab("collection")}
            className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === "collection" ? "border-indigo-400 text-indigo-400 bg-white/5" : "border-transparent text-zinc-500"
            }`}
          >
            🏆 Collection
          </button>
          <button
            onClick={() => setActiveTab("bounty")}
            className={`flex-1 text-center py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === "bounty" ? "border-indigo-400 text-indigo-400 bg-white/5" : "border-transparent text-zinc-500"
            }`}
          >
            ⚖️ Judge
          </button>
        </div>

        {/* Main Workspace Frame */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          
          {activeTab === "spin" && (
            <div className="space-y-8 animate-fade-in">

              {/* Wrong network banner */}
              {wrongChain && (
                <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-amber-400">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Wrong network detected. Please switch to <strong className="ml-1">{ritualChain.name}</strong> to record on-chain activity.
                  </div>
                  <button
                    onClick={() => switchChain({ chainId: ritualChain.id })}
                    className="ml-4 flex-shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-all"
                  >
                    Switch Network
                  </button>
                </div>
              )}

              {/* Wallet identity badge strip */}
              {isConnected && address && !wrongChain && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
                  <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-emerald-400/30 border border-white/10 text-sm">
                    🔮
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-400">On-Chain Identity Linked</p>
                    <p className="text-[11px] font-mono text-zinc-400 truncate">{address}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{ritualChain.name}</span>
                  </div>
                </div>
              )}

              {/* Prompt to connect wallet if not connected */}
              {!isConnected && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🔗</span>
                    <div>
                      <p className="text-xs font-semibold text-indigo-300">Connect wallet to link your streak to on-chain identity</p>
                      <p className="text-[11px] text-zinc-500">You can still spin without a wallet — data saves locally per device.</p>
                    </div>
                  </div>
                  <WalletConnect />
                </div>
              )}

              <section className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Explore Ritual Ecosystem.
                  <span className="block bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent mt-1">
                    One Spin, Every Day.
                  </span>
                </h2>
                <p className="text-sm text-zinc-400">
                  Spin to discover autonomous AI agents, on-chain decoders, and smart tools deployed
                  on the Ritual Network. Track streaks and claim your developer explorer status.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
                    🔥 Streak: <strong className="text-indigo-400">{streak}</strong> days
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
                    🌌 Discovered: <strong className="text-emerald-400">{collection.length}</strong> dApps
                  </span>
                  {isConnected && address && (
                    <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400 ring-1 ring-white/10">
                      🔮 <strong className="text-emerald-400 font-mono">{shortenAddress(address)}</strong>
                    </span>
                  )}
                </div>
              </section>

              {/* Spinner grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                <div className="flex justify-center">
                  <SpinWheel
                    canSpin={canSpin}
                    onSpinComplete={handleSpinComplete}
                    activeDApps={activeDApps}
                    prePickedWinner={prePickedWinner}
                  />
                </div>

                <div className="flex justify-center w-full">
                  {lastSpunDApp ? (
                    <DAppAnalysisCard dapp={lastSpunDApp} isSaved={true} />
                  ) : (
                    <div className="w-full rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500 bg-zinc-900/10 backdrop-blur flex items-center justify-center min-h-[300px]">
                      <div>
                        <div className="text-3xl mb-2">🎰</div>
                        <p className="text-sm font-semibold text-zinc-400">Ready to spin!</p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-[240px] mx-auto">
                          Click the center of the wheel to trigger daily ecosystem discovery.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORY & COLLECTION */}
          {activeTab === "collection" && (
            <div className="space-y-6">
              <section className="mb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Your Achievements &amp; Discovery Vault</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Revisit previously spun dApps, check your daily interaction logs, and view your ecosystem reward badges.
                  </p>
                </div>
                {isConnected && address && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs flex-shrink-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-emerald-400">{shortenAddress(address, 8)}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400">{ritualChain.name}</span>
                  </div>
                )}
              </section>
              <CollectionPanel
                history={history}
                collection={collection}
                badges={badges}
                allDApps={allDApps}
                streak={streak}
              />
            </div>
          )}

          {/* TAB 3: WORKSHOP BOUNTY JUDGE */}
          {activeTab === "bounty" && (
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  AI Bounty Judge Dashboard
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  A smart contract validator utility. Submit answers to a bounty, trigger general LLM precompile consensus, and finalize payout.
                </p>
              </section>

              {!isContractConfigured && (
                <Notice tone="amber">
                  No contract address configured. Configure `.env.local` setting `NEXT_PUBLIC_CONTRACT_ADDRESS` to write transactions to the chain.
                </Notice>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <CreateBountyForm onCreated={handleCreated} />
                <LoadBountyPanel selectedId={selectedId} onSelect={setSelectedId} recentIds={ids} />
              </div>

              {selectedId !== null && (
                <div className="mt-6">
                  <BountyView bountyId={selectedId} />
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Global footer */}
      <footer className="mx-auto w-full max-w-6xl border-t border-white/5 py-6 px-4 sm:px-6 text-center text-xs text-zinc-600 flex flex-col md:flex-row items-center justify-between gap-3 mt-12">
        <p>© 2026 Ritual Roulette · Created for Ecosystem Testnet Engagement.</p>
        <div>
          {contractAddress ? (
            <span className="font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              Ref Contract: {shortenAddress(contractAddress, 6)} (Chain {ritualChain.id})
            </span>
          ) : (
            <span className="text-zinc-500">Workshop Sandbox mode</span>
          )}
        </div>
      </footer>
    </div>
  );
}
