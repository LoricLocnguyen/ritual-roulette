import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { defineChain } from "viem";
import { injected, walletConnect } from "wagmi/connectors";
import { ritualChainId, ritualRpcUrl } from "@/config/contract";

/**
 * Custom Ritual Chain definition. RPC URL and chain id come from env vars so
 * the demo can target a local devnet, a shared testnet, or mainnet.
 */
export const ritualChain = defineChain({
  id: ritualChainId,
  name: "Ritual Chain",
  nativeCurrency: { name: "Ritual", symbol: "RITUAL", decimals: 18 },
  rpcUrls: {
    default: { http: [ritualRpcUrl] },
  },
  blockExplorers: {
    default: { name: "RitualScan", url: "https://explorer.ritualfoundation.org" },
  },
});

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();

const connectors = [
  injected({ shimDisconnect: true }),
  ...(walletConnectProjectId
    ? [walletConnect({ projectId: walletConnectProjectId })]
    : []),
];

export const config = createConfig({
  chains: [ritualChain],
  connectors,
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [ritualChain.id]: http(ritualRpcUrl),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
