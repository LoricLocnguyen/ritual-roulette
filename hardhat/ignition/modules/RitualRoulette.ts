import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RitualRouletteModule", (m) => {
  const roulette = m.contract("RitualRoulette");
  return { roulette };
});
