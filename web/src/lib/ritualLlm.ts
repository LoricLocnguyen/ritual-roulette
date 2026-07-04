import { encodeAbiParameters, parseAbiParameters } from "viem";

const llmParams = parseAbiParameters(
  "address, bytes[], uint256, bytes[], bytes, string, string, int256, string, bool, int256, string, string, uint256, bool, int256, string, bytes, int256, string, string, bool, int256, bytes, bytes, int256, int256, string, bool, (string,string,string)",
);

export function buildSpinLlmInput(dappName: string): `0x${string}` {
  // Thay địa chỉ bằng tài khoản node executor của bạn (có cấu hình ở Ritual chain gốc)
  const executorAddress =
    (process.env.NEXT_PUBLIC_RITUAL_EXECUTOR_ADDRESS as `0x${string}`) ||
    "0xB42e435c4252A5a2E7440e37B609F00c61a0c91B";
    
  const JUDGE_MODEL = "gpt-4o-mini";
  const JUDGE_TEMPERATURE = 0.5;
  const TEMPERATURE_SCALE = 1_000_000;
  const JUDGE_MAX_TOKENS = 120;
  
  // 1. Tạo Prompt ra lệnh cho LLM khen ngợi người chơi vừa trúng một dApp
  const prompt = `You are an AI narrator for a Web3 app called "Ritual Roulette". 
The user just spun the roulette and won an interaction with this dApp: ${dappName}. 
Write a short, engaging congratulatory tweet or sentence matching the theme of this single dapp. Max 20 words. No hastags.`;

  const messages = JSON.stringify([
    { role: "system", content: "You are a web3 narrative AI." },
    { role: "user", content: prompt }
  ]);

  // 2. ABI Encode để máy ảo Blockchain hiểu được và quăng vào TEE
  return encodeAbiParameters(llmParams, [
    executorAddress,
    [],                                            // encryptedSecrets (không dùng mã hóa)
    300n,                                          // ttl in blocks
    [],                                            // no additional secrets
    "0x",                                          // no extra context bytes
    messages,                                      // chat messages JSON
    JUDGE_MODEL,
    BigInt(Math.round(JUDGE_TEMPERATURE * TEMPERATURE_SCALE)),
    "none",                                        // stop sequence
    false,                                         // stream
    BigInt(JUDGE_MAX_TOKENS),
    "text",                                        // response format
    "",                                            // suffix
    0n,                                            // seed
    false,                                         // logprobs
    0n,                                            // top_logprobs
    "",                                            // user
    "0x",                                          // tools bytes
    0n,                                            // tool_choice
    "",                                            // tool_choice_name
    "",                                            // parallel_tool_calls
    false,                                         // store
    0n,                                            // reasoning_effort
    "0x",                                          // metadata
    "0x",                                          // modalities
    0n,                                            // audio
    0n,                                            // prediction
    "",                                            // service_tier
    false,                                         // stream_options
    ["", "", ""],                                  // convo history
  ]);
}

export type JudgeSubmission = any;
export function buildJudgeAllLlmInput(args: any): any { return "0x"; }
