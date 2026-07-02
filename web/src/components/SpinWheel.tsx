import { useState, useRef, useEffect } from "react";
import { DApp } from "@/hooks/useDailySpin";

interface SpinWheelProps {
  canSpin: boolean;
  onSpinComplete: (dapp: DApp) => void;
  activeDApps: DApp[];
  prePickedWinner?: DApp | null; // pre-determined winner for sync with hook
}

const SEGMENTS = 12; // Number of visible wheel segments

export function SpinWheel({ canSpin, onSpinComplete, activeDApps, prePickedWinner }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelSegments, setWheelSegments] = useState<DApp[]>([]);
  const [rotation, setRotation] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const wheelRef = useRef<HTMLDivElement>(null);

  // Build wheel segments including the pre-picked winner
  const buildSegments = (winner: DApp | null | undefined, pool: DApp[]): DApp[] => {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    // Remove winner from shuffled to avoid duplicate, then prepend it at index 0
    const filtered = winner ? shuffled.filter((d) => d.id !== winner.id) : shuffled;
    const base = winner ? [winner, ...filtered] : filtered;
    return base.slice(0, SEGMENTS);
  };

  useEffect(() => {
    if (activeDApps.length === 0) return;
    setWheelSegments(buildSegments(prePickedWinner, activeDApps));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDApps, prePickedWinner]);

  const handleSpinClick = () => {
    if (isSpinning || !canSpin || wheelSegments.length < SEGMENTS) return;

    setIsSpinning(true);
    setStatusMessage("Triggering TEE enclave spin computation...");

    // The winner is always at index 0 in our segment array
    const winningIndex = 0;
    const winningDapp = wheelSegments[winningIndex];

    const segmentAngle = 360 / SEGMENTS;
    const baseRotation = 1800; // 5 full turns
    // Winner is at index 0. Spin so segment-0 lands at the top pointer (position 0°).
    // Add a small random offset within ±(segmentAngle/3) for natural feel
    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.4);
    const targetRotation = rotation + baseRotation + jitter;

    setRotation(targetRotation);

    const timingSequence = [
      { delay: 900,  msg: "Connecting to Ritual LLM precompile (0x0802)..." },
      { delay: 2000, msg: "Allocating TEE enclave execution buffer..." },
      { delay: 3200, msg: "Structuring on-chain validator responses..." },
      { delay: 4300, msg: "Verifying cryptographic proof via DKMS (0x0009)..." },
      { delay: 4900, msg: "Spin complete. Decoding result payload..." },
    ];

    timingSequence.forEach((step) => {
      setTimeout(() => setStatusMessage(step.msg), step.delay);
    });

    setTimeout(() => {
      setIsSpinning(false);
      setStatusMessage("");
      onSpinComplete(winningDapp);

      // Next day's wheel: rebuild with a fresh random order (no pre-pick yet)
      const shuffled = [...activeDApps].sort(() => 0.5 - Math.random());
      setWheelSegments(shuffled.slice(0, SEGMENTS));
    }, 5100);
  };

  if (wheelSegments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500 text-xs">
        Loading {activeDApps.length} testnet dApps...
      </div>
    );
  }

  // 12 gradient color themes for wedges
  const colors = [
    "from-indigo-600/25 to-indigo-950/50",
    "from-emerald-600/25 to-emerald-950/50",
    "from-purple-600/25 to-purple-950/50",
    "from-teal-600/25 to-teal-950/50",
    "from-blue-600/25 to-blue-950/50",
    "from-cyan-600/25 to-cyan-950/50",
    "from-violet-600/25 to-violet-950/50",
    "from-fuchsia-600/25 to-fuchsia-950/50",
    "from-sky-600/25 to-sky-950/50",
    "from-pink-600/25 to-pink-950/50",
    "from-rose-600/25 to-rose-950/50",
    "from-amber-600/25 to-amber-950/50",
  ];

  const segmentAngleDeg = 360 / SEGMENTS; // 30° each for 12 segments

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Pointer */}
      <div className="relative z-10 -mb-4 flex flex-col items-center">
        <svg
          className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21l-9-15h18z" />
        </svg>
      </div>

      {/* Wheel Wrapper */}
      <div className="relative h-[340px] w-[340px] rounded-full p-2 ring-2 ring-white/10 bg-zinc-950 drop-shadow-[0_0_25px_rgba(99,102,241,0.15)] md:h-[400px] md:w-[400px]">
        {/* Underlay glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-xl pointer-events-none" />

        {/* Rotating Wheel Container */}
        <div
          ref={wheelRef}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "transform 5.0s cubic-bezier(0.1, 0.8, 0.2, 1)" : "none",
          }}
          className="relative h-full w-full overflow-hidden rounded-full border border-white/5 bg-zinc-900"
        >
          {wheelSegments.map((dapp: DApp, idx: number) => {
            const angle = segmentAngleDeg * idx;
            // clipPath for a 30° wedge (for 12 segments)
            // tan(15°) ≈ 0.268 → half-width at top edge = 26.8% from center
            return (
              <div
                key={dapp.id}
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "50% 50%",
                }}
                className="absolute inset-0 flex h-full w-full"
              >
                {/* Wedge segment - 30° slice */}
                <div
                  style={{
                    clipPath: "polygon(50% 50%, 23% 0%, 77% 0%)",
                  }}
                  className={`absolute inset-0 bg-gradient-to-b ${colors[idx % colors.length]} border-r border-white/5`}
                />

                {/* Label inside wedge */}
                <div
                  style={{
                    transform: `rotate(${segmentAngleDeg / 2}deg) translateY(-140px)`,
                    transformOrigin: "50% 100%",
                    left: "calc(50% - 48px)",
                    bottom: "50%",
                  }}
                  className="absolute w-24 text-center text-[9px] font-semibold tracking-wide text-zinc-200 md:text-[10px]"
                >
                  <span className="block truncate leading-tight px-1">{dapp.name}</span>
                </div>
              </div>
            );
          })}

          {/* Innermost hub ring */}
          <div className="absolute left-[38%] top-[38%] h-[24%] w-[24%] rounded-full border border-white/10 bg-zinc-950 shadow-inner" />
        </div>

        {/* Center button (Spindle) - absolutely centered */}
        <button
          onClick={handleSpinClick}
          disabled={isSpinning || !canSpin}
          className={`absolute left-1/2 top-1/2 z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700/50 flex flex-col items-center justify-center text-center font-bold tracking-wider transition-all duration-300 ${
            !canSpin
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
              : isSpinning
                ? "bg-zinc-900 text-indigo-400 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse"
                : "bg-gradient-to-br from-indigo-500 to-indigo-700 text-zinc-950 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer active:scale-95"
          }`}
        >
          <span className="text-[10px] uppercase font-black leading-none">
            {isSpinning ? "Spining" : !canSpin ? "Spun" : "Spin"}
          </span>
          <span className="text-[8px] opacity-75 font-medium mt-0.5 leading-none">
            {isSpinning ? "..." : !canSpin ? "Tomorrow" : "Now"}
          </span>
        </button>
      </div>

      {/* TEE / Precompile Status text */}
      <div className="mt-6 h-8 text-center">
        {statusMessage ? (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            {statusMessage}
          </div>
        ) : !canSpin ? (
          <p className="text-xs text-zinc-500">
            You've completed your daily spin. Check back tomorrow!
          </p>
        ) : (
          <p className="text-xs text-indigo-300">
            Click SPIN to secure your daily testnet interaction
          </p>
        )}
      </div>
    </div>
  );
}
