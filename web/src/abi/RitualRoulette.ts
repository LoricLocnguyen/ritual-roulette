// Auto-generated ABI for RitualRoulette.sol
const ritualRouletteAbi = [
  {
    type: "function",
    name: "fundAIFees",
    inputs: [{ name: "lockDuration", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "submitDailySpin",
    inputs: [
      { name: "dapp", type: "string" },
      { name: "llmPromptInput", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getUserHistory",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "string[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lastSpinTime",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "RouletteSpun",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "dapp", type: "string", indexed: false },
      { name: "aiGeneratedTweet", type: "bytes", indexed: false },
    ],
  },
] as const;

export default ritualRouletteAbi;
