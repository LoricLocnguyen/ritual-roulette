import { useState } from "react";
import { DApp, SpinRecord, AchievementBadge } from "@/hooks/useDailySpin";

interface CollectionPanelProps {
  history: SpinRecord[];
  collection: string[];
  badges: AchievementBadge[];
  allDApps: DApp[];
  streak: number;
}

export function CollectionPanel({ history, collection, badges, allDApps, streak }: CollectionPanelProps) {
  const [selectedHistoryDapp, setSelectedHistoryDapp] = useState<DApp | null>(null);

  // Hardcoded registry of all possible badges for graying out locked ones
  const ALL_POSSIBLE_BADGES = [
    { id: "first_spin", title: "Ritual Initiate", description: "Spun the wheel for the first time!", icon: "🎯" },
    { id: "llm_pioneer", title: "LLM Pioneer", description: "Explored 3 dApps integrated with LLM precompiles.", icon: "🤖" },
    { id: "multimodal", title: "Multimodal Architect", description: "Explored 2 media/NFT signature generators.", icon: "🎨" },
    { id: "explorer_10", title: "Cosmic Voyager", description: "Discovered 10 unique dApps inside the Ritual ecosystem.", icon: "🌌" },
    { id: "streak_3", title: "Committed Ritualist", description: "Maintained a 3-day spin streak.", icon: "🔥" },
  ];

  const getDAppById = (id: string): DApp | undefined => {
    return allDApps.find((d) => d.id === id);
  };

  const getSecondsOrDate = (timeMs: number) => {
    return new Date(timeMs).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Profile & Streaks */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 backdrop-blur-sm lg:col-span-1 space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute -top-1.5 -right-1 text-xs">🐙</span>
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-950/50 border border-indigo-500/30 text-2xl">
              🧬
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Ritual Explorer</h3>
            <p className="text-xs text-zinc-500">Testnet Identity</p>
          </div>
        </div>

        {/* Streak Counter details */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="rounded-xl bg-white/5 border border-white/5 p-3.5 text-center">
            <div className="text-[28px] font-black text-indigo-400 leading-tight flex justify-center items-center gap-1.5">
              🔥 {streak}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">
              Active Streak
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/5 p-3.5 text-center">
            <div className="text-[28px] font-black text-emerald-400 leading-tight">
              {collection.length}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">
              DApps Found
            </div>
          </div>
        </div>

        {/* Badge details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-widest border-b border-white/5 pb-1.5">
            Ecosystem Achievements ({badges.length}/{ALL_POSSIBLE_BADGES.length})
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {ALL_POSSIBLE_BADGES.map((proto) => {
              const unlockedInfo = badges.find((b) => b.id === proto.id);
              const isUnlocked = !!unlockedInfo;

              return (
                <div
                  key={proto.id}
                  title={`${proto.title}: ${proto.description} ${
                    isUnlocked ? `(Unlocked: ${getSecondsOrDate(unlockedInfo.unlockedAt)})` : "(Locked)"
                  }`}
                  className={`relative grid h-12 w-full place-items-center rounded-lg border transition-all cursor-help ${
                    isUnlocked
                      ? "bg-indigo-500/10 border-indigo-500/30 text-xl"
                      : "bg-zinc-950/80 border-white/5 text-zinc-600 grayscale opacity-40 hover:opacity-60"
                  }`}
                >
                  <span>{proto.icon}</span>
                  {isUnlocked && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-500 text-[8px] text-zinc-950 font-bold">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Discovery History & Registry */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-5 backdrop-blur-sm lg:col-span-2">
        <h3 className="font-bold text-white text-base border-b border-white/5 pb-2.5">
          Discovery Vault
        </h3>
        
        {history.length === 0 ? (
          <div className="flex h-44 items-center justify-center text-center text-xs text-zinc-500">
            No dApps have been discovered yet.
            <br />
            Spin the Roulette to register your first interaction!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
            {/* Scrollable list of spun items */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {history
                .slice()
                .reverse()
                .map((record, index) => {
                  const dapp = getDAppById(record.dappId);
                  const isSelected = selectedHistoryDapp?.id === record.dappId;

                  return (
                    <button
                      key={`${record.dappId}-${record.timestamp}-${index}`}
                      onClick={() => dapp && setSelectedHistoryDapp(dapp)}
                      className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-indigo-500/10 border-indigo-500/30"
                          : "bg-zinc-900/50 hover:bg-zinc-900 border-white/5"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">
                          {record.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                          Spun on {getSecondsOrDate(record.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {dapp?.ritual_stack.precompiles.slice(0, 1).map((pre: string) => (
                          <span
                            key={pre}
                            className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/50"
                          >
                            {pre}
                          </span>
                        ))}
                        <span className="text-zinc-500 text-xs font-bold">→</span>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Quick overview of selected spun item */}
            <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-4 flex flex-col justify-between min-h-[250px]">
              {selectedHistoryDapp ? (
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{selectedHistoryDapp.name}</h4>
                        <span className="text-[10px] text-zinc-500">
                          {selectedHistoryDapp.creator.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedHistoryDapp.ritual_stack.precompiles.map((pre: string) => (
                          <span
                            key={pre}
                            className="text-[8px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20"
                          >
                            {pre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-4">
                      {selectedHistoryDapp.description}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex gap-2">
                    <a
                      href={selectedHistoryDapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-1.5 text-xs transition-all"
                    >
                      Open DApp
                    </a>
                  </div>
                </div>
              ) : (
                <div className="m-auto text-center text-xs text-zinc-500 py-6">
                  Select a dApp record from the history on the left to view detailed insights.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
