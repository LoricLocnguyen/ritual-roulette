"use client";

import { useEffect, useState } from "react";
import type { SpinTxStatus } from "@/hooks/useSpinTransaction";
import { rouletteContractAddress } from "@/config/contract";

interface AgentBotPanelProps {
  dappName: string;
  status: SpinTxStatus;
  txHash?: `0x${string}`;
  aiMessage?: string;
  error?: string;
  onClose: () => void;
}

/** Typing animation: renders text character-by-character */
function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-emerald-200">
      {displayed}
      {!done && <span className="animate-pulse text-emerald-400">▌</span>}
    </span>
  );
}

const statusSteps: { key: SpinTxStatus; label: string }[] = [
  { key: "building", label: "Encoding Ritual LLM prompt…" },
  { key: "signing",  label: "Waiting for wallet signature…" },
  { key: "pending",  label: "Broadcasting to Ritual Chain…" },
  { key: "confirmed",label: "Deploying AI Agent in TEE…" },
  { key: "success",  label: "Agent online ✓" },
];

export function AgentBotPanel({
  dappName,
  status,
  txHash,
  aiMessage,
  error,
  onClose,
}: AgentBotPanelProps) {
  const explorerBase = "https://explorer.ritualfoundation.org";
  const currentStepIdx = statusSteps.findIndex((s) => s.key === status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-zinc-950 shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-emerald-950/30 px-4 py-3">
          <div className="flex items-center gap-2.5">
            {/* Animated bot avatar */}
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-lg shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              🤖
              {status !== "success" && status !== "error" && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-400 animate-pulse" />
              )}
              {status === "success" && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-black text-white">Ritual AI Agent</p>
              <p className="text-[10px] text-emerald-400 font-mono">
                {rouletteContractAddress
                  ? `contract: ${rouletteContractAddress.slice(0, 10)}…`
                  : "sandbox mode · no contract"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-200 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress steps */}
        {status !== "success" && status !== "error" && (
          <div className="border-b border-white/5 px-4 py-3 space-y-1.5">
            {statusSteps.slice(0, -1).map((step, idx) => {
              const done = currentStepIdx > idx;
              const active = currentStepIdx === idx;
              return (
                <div key={step.key} className="flex items-center gap-2">
                  <div className={`h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    done
                      ? "bg-emerald-500 text-zinc-950"
                      : active
                        ? "bg-indigo-500 text-white animate-pulse"
                        : "bg-zinc-800 text-zinc-600"
                  }`}>
                    {done ? "✓" : idx + 1}
                  </div>
                  <span className={`text-[11px] font-mono transition-all ${
                    done ? "text-emerald-400 line-through opacity-50" : active ? "text-indigo-300" : "text-zinc-600"
                  }`}>
                    {step.label}
                  </span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div className="px-4 py-4 space-y-3 max-h-72 overflow-y-auto">
          {/* Bot "speech bubble" */}
          <div className="flex gap-2.5">
            <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-sm">
              🤖
            </div>
            <div className="flex-1 rounded-xl rounded-tl-none bg-emerald-950/40 border border-emerald-500/20 px-3 py-2.5">
              {status === "error" ? (
                <p className="text-xs text-red-400 font-mono">{error ?? "Transaction failed. Please try again."}</p>
              ) : status === "success" && aiMessage ? (
                <TypingText text={aiMessage} />
              ) : (
                <p className="text-xs text-zinc-500 font-mono animate-pulse">
                  Deploying agent for <strong className="text-zinc-300">{dappName}</strong>…
                </p>
              )}
            </div>
          </div>

          {/* Tx hash link */}
          {txHash && (
            <a
              href={`${explorerBase}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/3 px-3 py-2 text-[10px] font-mono text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
            >
              <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View tx: {txHash.slice(0, 20)}…
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between bg-zinc-900/30">
          <p className="text-[10px] text-zinc-600">
            Each spin = 1 agent deployed on Ritual TEE
          </p>
          {status === "success" && (
            <button
              onClick={onClose}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-zinc-950 hover:bg-emerald-400 transition-all"
            >
              Got it! 🚀
            </button>
          )}
          {status === "error" && (
            <button
              onClick={onClose}
              className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/30 transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
