import { useState } from "react";
import { DApp } from "@/hooks/useDailySpin";

interface DAppAnalysisCardProps {
  dapp: DApp;
  onSaveToCollection?: (dappId: string) => void;
  isSaved?: boolean;
}

export function DAppAnalysisCard({ dapp, onSaveToCollection, isSaved = false }: DAppAnalysisCardProps) {
  const [activeTab, setActiveTab] = useState<"builder" | "product" | "tech">("product");

  const xShareText = `Hôm nay vòng quay Ritual đưa mình đến ${dapp.name} (${dapp.url}) của ${
    dapp.creator.inferred_creator_handle ? `@${dapp.creator.inferred_creator_handle}` : "chưa rõ builder"
  } - dapp dùng ${dapp.ritual_stack.precompiles.join(", ")} để tăng cường năng lực AI/hạ tầng! #RitualChain #RitualRoulette`;

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xShareText)}`;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-md shadow-xl transition-all duration-300">
      {/* Title */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            Daily Discovery Result
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">{dapp.name}</h2>
          <a
            href={dapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1 mt-0.5"
          >
            {dapp.url.replace(/^https?:\/\//, "")}
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          {onSaveToCollection && (
            <button
              onClick={() => onSaveToCollection(dapp.id)}
              disabled={isSaved}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                isSaved
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 cursor-default"
                  : "bg-white/5 text-white border-white/10 hover:bg-white/10"
              }`}
            >
              <svg className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {isSaved ? "Saved to Collection" : "Save result"}
            </button>
          )}

          <a
            href={xShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold px-3 py-1.5 text-xs transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post to X
          </a>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 mt-4">
        <button
          onClick={() => setActiveTab("product")}
          className={`px-4 py-2 text-xs font-semibold tracking-wider transition-all border-b-2 -mb-[2px] ${
            activeTab === "product"
              ? "border-indigo-400 text-indigo-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          WHAT IT DOES
        </button>
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-2 text-xs font-semibold tracking-wider transition-all border-b-2 -mb-[2px] ${
            activeTab === "builder"
              ? "border-indigo-400 text-indigo-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          THE BUILDER
        </button>
        <button
          onClick={() => setActiveTab("tech")}
          className={`px-4 py-2 text-xs font-semibold tracking-wider transition-all border-b-2 -mb-[2px] ${
            activeTab === "tech"
              ? "border-indigo-400 text-indigo-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          RITUAL INTEGRATION
        </button>
      </div>

      {/* Tab panel display */}
      <div className="py-5 min-h-[160px]">
        {activeTab === "product" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">Product Analysis</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{dapp.description}</p>
            <div className="pt-2">
              <a
                href={dapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-zinc-950 font-bold px-4 py-2 text-xs transition-all"
              >
                Launch application
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {activeTab === "builder" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Creator Mock Avatar */}
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-400/20 border border-white/10 text-xl text-white font-bold">
                {dapp.creator.inferred_creator_handle ? dapp.creator.inferred_creator_handle.slice(0, 2).toUpperCase() : "?"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-100">{dapp.creator.name}</span>
                  {dapp.creator.handle_verified ? (
                    <span
                      title="Verified Builder"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-zinc-950 font-extrabold"
                    >
                      ✓
                    </span>
                  ) : (
                    <span 
                      title="Inferred handle. Not yet verified." 
                      className="rounded bg-zinc-800 px-1 py-0.5 text-[8px] font-medium text-zinc-400 uppercase tracking-widest border border-zinc-700/50"
                    >
                      Inferred
                    </span>
                  )}
                </div>
                {dapp.creator.social_url && (
                  <a
                    href={dapp.creator.social_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                  >
                    View profile on X
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-white/5 p-3.5 border border-white/5 text-xs text-zinc-400 leading-relaxed">
              {dapp.creator.inferred_creator_handle ? (
                <span>
                  This dApp was submitted by developer <strong>@{dapp.creator.inferred_creator_handle}</strong>.
                  {!dapp.creator.handle_verified && (
                    <span> This handle was automatically inferred from the testnet hosting domain. Are you the owner? Join the Ritual Discord and DM moderators to verify your handle!</span>
                  )}
                </span>
              ) : (
                <span>
                  Creator registry is currently unclaimed for this dApp. If you are the owner, please DM the Ritual Discord administrators to claim this project profile.
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "tech" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">On-Chain Precompiles & Stack</h3>
            <div className="flex flex-wrap gap-2">
              {dapp.ritual_stack.precompiles.map((pre) => {
                const isPrecompileHex = pre.startsWith("0x");
                return (
                  <span
                    key={pre}
                    className={`rounded-full px-3 py-1 text-xs font-mono font-medium ring-1 ring-inset ${
                      isPrecompileHex
                        ? "bg-indigo-500/10 text-indigo-400 ring-indigo-500/30"
                        : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
                    }`}
                  >
                    {pre}
                  </span>
                );
              })}
            </div>

            <div className="space-y-2.5 mt-2">
              {Object.entries(dapp.ritual_stack.details).map(([key, desc]) => (
                <div key={key} className="flex gap-2 text-xs">
                  <span className="font-mono text-zinc-100 font-semibold min-w-[70px]">{key}:</span>
                  <span className="text-zinc-400 leading-normal">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
