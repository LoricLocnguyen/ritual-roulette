// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PrecompileConsumer} from "./utils/PrecompileConsumer.sol";

// Giao diện (Interface) kết nối với RitualWallet hệ thống
interface IRitualWallet {
    function deposit(uint256 lockDuration) external payable;
}

contract RitualRoulette is PrecompileConsumer {
    // Địa chỉ gốc RitualWallet trên mạng Ritual Testnet
    IRitualWallet wallet = IRitualWallet(0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948);
    
    struct ConvoHistory {
        string storageType;
        string path;
        string secretsName;
    }

    // Lưu lại thời gian spin của mỗi ví (giới hạn 1 ngày/lần)
    mapping(address => uint256) public lastSpinTime;
    
    // Lưu lịch sử các dApp đã quay trúng
    mapping(address => string[]) public userHistory;
    
    // Sự kiện được phát ra mạng lưới sau khi hoàn tất
    event RouletteSpun(address indexed user, string dapp, bytes aiGeneratedTweet);

    // Hàm 1: Nạp tiền phí (RITUAL) cho hợp đồng để nuôi AI chạy
    function fundAIFees(uint256 lockDuration) external payable {
        require(msg.value > 0, "Requires RITUAL tokens");
        wallet.deposit{value: msg.value}(lockDuration);
    }

    // Hàm 2: Gọi sau khi vòng quay dừng - Ghi lịch sử & Dùng AI viết Tweet
    function submitDailySpin(string calldata dapp, bytes calldata llmPromptInput) external {
        // Kiểm tra xem đã qua 24h kể từ lần quay trước chưa
        // (Tạm comment để test cho dễ, sau này bật lên)
        // require(block.timestamp >= lastSpinTime[msg.sender] + 1 days, "Wait 24h for next spin");
        
        // 1. Lưu dữ liệu on-chain
        lastSpinTime[msg.sender] = block.timestamp;
        userHistory[msg.sender].push(dapp);
        
        // 2. Gọi sức mạnh AI từ lõi Blockchain (Precompile)
        bytes memory aiOutputRaw = _executePrecompile(LLM_INFERENCE_PRECOMPILE, llmPromptInput);
        
        // 3. Giải mã kết quả AI trả về
        (
            bool hasError,
            bytes memory aiTextResult,
            ,
            string memory errorMessage,
        ) = abi.decode(aiOutputRaw, (bool, bytes, bytes, string, ConvoHistory));

        require(!hasError, errorMessage);
        
        // 4. Phát thông báo ra ngoài Frontend
        emit RouletteSpun(msg.sender, dapp, aiTextResult);
    }

    // Hàm lấy danh sách dApp đã trúng
    function getUserHistory(address user) external view returns (string[] memory) {
        return userHistory[user];
    }
}
