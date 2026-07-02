# PROMPT: "Ritual Roulette" — Vòng Quay Trải Nghiệm Testnet Hàng Ngày cho Hệ Sinh Thái RITUAL

## 1. Bối cảnh & mục tiêu

Xây dựng một web app tên tạm là **"Ritual Roulette"** (có thể đổi tên: RitualSpin, RitualDaily, DappWheel...) — cổng trải nghiệm testnet duy nhất cho toàn bộ hệ sinh thái **Ritual Chain** (docs.ritualfoundation.org).

Cơ chế cốt lõi:
- Mỗi ngày, người dùng quay 1 vòng quay (roulette wheel).
- Vòng quay random ra **1 dapp testnet** trong kho dữ liệu hệ sinh thái Ritual.
- Khi dapp hiện ra, hệ thống AI tự động phân tích và hiển thị:
  1. **Thông tin nhà phát triển**: username X (Twitter), tên team/founder, liên kết social, lịch sử các dự án khác (nếu có).
  2. **Phân tích dapp**: dapp này làm gì, giải quyết bài toán gì, đối tượng người dùng.
  3. **Stack tích hợp Ritual on-chain**: dapp này dùng những precompile/agent nào của Ritual (AI agent, smart contract agent, deploy agent...).
- Người dùng bấm vào để trải nghiệm trực tiếp dapp đó (mở link testnet / nhúng iframe nếu được).
- Có lưu lịch sử, streak (chuỗi ngày quay liên tục), và thành tích khám phá.

Mục tiêu sản phẩm: biến việc khám phá hệ sinh thái Ritual (vốn rời rạc, phải tự tìm dapp) thành một trải nghiệm **gamified, mỗi ngày một khám phá mới**, đồng thời AI đóng vai trò "hướng dẫn viên" giải thích kỹ thuật đằng sau mỗi dapp cho người dùng không chuyên sâu.

---

## 2. Kiến thức nền về Ritual (để AI hiểu đúng khi phân tích dapp)

Khi phân tích bất kỳ dapp nào trong hệ sinh thái, AI cần hiểu đúng ngữ cảnh kỹ thuật của Ritual Chain — **không bịa thông tin, chỉ mô tả dựa trên các khái niệm thật sau**:

- **Ritual Chain** là Layer 1 EVM++ (tương thích Solidity/Hardhat/Foundry), có 2 luồng thực thi song song trên cùng 1 state:
  - *Replicated execution*: các thao tác xác định (chuyển token, đọc storage...) — mọi validator re-execute.
  - *Delegated execution*: các tác vụ không xác định (LLM inference, HTTP call, tạo ảnh...) — chạy 1 lần trong TEE (Trusted Execution Environment), kết quả được verify chứ không replicate.
- **16 precompile gốc** cho phép smart contract gọi thẳng các năng lực AI/hạ tầng mà không cần oracle ngoài, ví dụ:
  - `0x0801` — HTTP precompile (gọi API ngoài)
  - `0x0802` — LLM inference precompile (gọi model ngôn ngữ)
  - `0x0805` — Long-running HTTP (tác vụ chạy dài)
  - `0x0818–0x081A` — Multimodal (ảnh/audio/video)
  - `0x0820` / `0x080C` — Agent precompiles
  - `0x0800` — ONNX ML inference
  - `0x0009` — Ed25519 signature verification
  - DKMS (key derivation trong enclave), ECIES (mã hoá secrets), X402 (vi thanh toán micropayment)
- **Scheduler**: hợp đồng có thể tự lên lịch thực thi định kỳ, không cần "keeper bot" ngoài — đây là điểm khác biệt lớn của Ritual so với các chain khác.
- **RitualWallet**: agent có thể giữ ví riêng, tự nạp phí, tự chi tiêu mà không cần con người approve từng giao dịch.
- **Sovereign agent lifecycle**: agent trên Ritual có thể "sống" độc lập — tự lên lịch, tự trả phí, tự phục hồi từ checkpoint nếu die, không phụ thuộc người tạo ra nó.
- **Builder/Debugger agent pipeline**: một AI agent (vd Claude Code) có thể đọc bộ "ritual-dapp-skills", tự sinh smart contract, tự deploy lên RPC, tự nạp ví, và nếu lỗi thì một debugger agent khác tự động triage + fix + re-verify — toàn bộ không cần con người duyệt code.

→ Khi AI phân tích 1 dapp trong app, nó nên cố gắng nhận diện dapp đó đang dùng **những precompile/lớp hạ tầng nào ở trên** (dựa vào mô tả dapp, README, hoặc contract nếu có), thay vì nói chung chung "dapp AI".

---

## 3. Luồng trải nghiệm người dùng (UX Flow)

1. **Trang chủ**: hiển thị vòng quay lớn, nút "Quay hôm nay" (giới hạn 1 lần/ngày theo UTC hoặc theo local time, có thể reset lúc 00:00). Hiện streak hiện tại + tổng số dapp đã khám phá.
2. **Animation quay**: vòng quay xoay ngẫu nhiên qua danh sách dapp, dừng lại ở 1 dapp — hiệu ứng giống roulette/casino nhưng phong cách phù hợp branding Ritual (tối giản, futuristic, không giống cờ bạc để tránh hiểu lầm).
3. **Card kết quả** hiện ra gồm 3 tab / 3 khối:
   - **"Ai làm ra nó"**: avatar, tên, @handle X, link profile, mô tả ngắn về builder (AI tóm tắt từ tiểu sử công khai nếu có).
   - **"Nó làm gì"**: mô tả dapp bằng ngôn ngữ dễ hiểu (2-4 câu) + use case + đối tượng dùng.
   - **"Nó chạy trên Ritual như thế nào"**: liệt kê các thành phần kỹ thuật (AI agent / smart contract agent / deploy agent / scheduler / precompile nào...) dưới dạng badge/tag trực quan, kèm giải thích 1 dòng cho mỗi tag.
4. **Nút hành động**: "Trải nghiệm ngay" (mở dapp ở tab mới hoặc nhúng), "Lưu vào bộ sưu tập", "Chia sẻ lên X" (tạo sẵn caption).
5. **Trang bộ sưu tập cá nhân**: lưu tất cả dapp đã quay trúng, có thể quay lại xem phân tích cũ.
6. **Trang khám phá thủ công** (tuỳ chọn): danh sách toàn bộ dapp trong hệ sinh thái, filter theo loại precompile sử dụng.

---

## 4. Nguồn dữ liệu dapp (đã có dữ liệu thật)

Nguồn gốc: Google Sheet cộng đồng **"Community_Ritual_Dapps_List"** — đã được trích xuất thành `ritual-dapp-list.json` (29 dapp tính đến thời điểm lấy dữ liệu).

**Giới hạn quan trọng của dữ liệu gốc — AI builder phải xử lý đúng, không được bỏ qua:**
- Sheet **chỉ có link dapp + tên/chức năng ngắn**. **Không có X handle hay tên builder đã xác thực.**
- Một số link Replit có dạng `ten-dapp--username.replit.app`, trong đó `username` là **suy đoán** từ URL (username Replit), **không chắc chắn trùng với X handle thật** của người tạo. File JSON đã đánh dấu các trường này là `inferred_creator_handle` (8/29 dapp có gợi ý, phần còn lại `null`).
- 2 dapp được gắn cờ `needs_review: true`: 1 do tên URL chứa từ ngữ phản cảm (`jumping-siggy-the-pussy`), 1 do handle suy đoán từ domain riêng chứ không phải nền tảng hosting chuẩn (`haezl-trading.info`) — cần duyệt thủ công trước khi đưa vào vòng quay.

**Quy trình enrichment bắt buộc trước khi 1 dapp "đủ điều kiện" hiện đầy đủ profile builder trong app:**
1. Với dapp có `inferred_creator_handle`: tìm kiếm xem handle đó có tồn tại trên X không, có liên hệ gì tới dự án Ritual không (vd tweet nhắc tới link dapp) → nếu khớp, đánh dấu `handle_verified: true`; nếu không tìm thấy bằng chứng, giữ nguyên là "chưa xác định", **không hiển thị như thông tin chắc chắn**.
2. Với dapp không có gợi ý handle (`null`): hiển thị trong app là "Chưa rõ builder — DM mods Ritual Discord để claim dapp này" thay vì để trống trơn hoặc bịa ra.
3. Với 2 dapp `needs_review`: KHÔNG đưa vào vòng quay cho tới khi có người duyệt thủ công (ẩn khỏi pool bằng 1 cờ `active: false` trong dữ liệu).
4. Phần "dapp này làm gì" và "dùng precompile/agent nào của Ritual" AI **chỉ được suy luận dựa trên việc thực sự mở/khảo sát dapp** (tên gợi ý chức năng, không phải bằng chứng kỹ thuật chắc chắn) — nếu không thể xác minh dapp dùng precompile cụ thể nào, hiển thị nhãn chung "Chưa xác định chi tiết tích hợp on-chain" thay vì đoán bừa loại precompile.

**Roadmap cập nhật dữ liệu:**
- **Giai đoạn 1 (MVP — dùng ngay)**: import `ritual-dapp-list.json`, lọc bỏ các dapp `needs_review`, chạy enrichment thủ công/AI-search 1 lần cho từng dapp, lưu kết quả cache lại (không gọi AI phân tích lại mỗi lần user quay trúng, trừ khi dữ liệu dapp thay đổi).
- **Giai đoạn 2**: form submit cho builder tự đăng ký/cập nhật dapp của họ, xác thực qua đăng nhập X OAuth để gắn handle chắc chắn 100% (giải quyết triệt để vấn đề "suy đoán" ở trên).
- **Giai đoạn 3**: đồng bộ định kỳ lại từ Google Sheet gốc (hoặc bản cập nhật mới của mods) để bắt các dapp mới được thêm vào, có bước duyệt thủ công trước khi active.

AI phân tích dapp (mục 3, bước "card kết quả") nên chạy **1 lần rồi cache**, không phân tích lại mỗi lần user quay trúng — tiết kiệm chi phí và tránh AI trả lời khác nhau mỗi lần cho cùng 1 dapp.

---

## 5. Gợi ý kiến trúc kỹ thuật

- **Frontend**: React + Tailwind, animation vòng quay dùng CSS transform/`framer-motion` hoặc canvas nếu cần mượt.
- **Backend**: lưu danh sách dapp + lịch sử user trong DB (Postgres/Supabase) hoặc đơn giản hơn là key-value storage nếu làm dạng artifact/app nhỏ gọn.
- **AI phân tích**: gọi Claude API, prompt hệ thống mô tả rõ bối cảnh Ritual (dùng nội dung mục 2 ở trên làm system context) + dữ liệu thô của dapp (mô tả, README, tweet builder...) → trả về JSON có cấu trúc 3 phần (builder / dapp / tech stack) để render UI nhất quán.
- **Chống lặp**: đảm bảo không quay trúng lại dapp đã quay trong vòng N ngày gần nhất (trừ khi kho dapp đã hết).
- **Giới hạn 1 lần/ngày**: lưu timestamp lần quay cuối theo user (localStorage cho bản đơn giản, hoặc theo tài khoản nếu có đăng nhập ví Web3).
- **Đăng nhập tuỳ chọn**: connect wallet (MetaMask, theo chuẩn Ritual testnet) để gắn lịch sử quay với địa chỉ ví, tạo cảm giác "on-chain identity" nhất quán với tinh thần dự án Ritual.

---

## 6. Gamification (tăng giữ chân người dùng)

- **Streak**: số ngày quay liên tục, hiện icon lửa.
- **Huy hiệu khám phá**: "Đã trải nghiệm 10 dapp dùng LLM precompile", "Đã gặp 5 dapp có Scheduler", v.v — khuyến khích người dùng tò mò về đa dạng kỹ thuật.
- **Bảng xếp hạng cộng đồng** (tuỳ chọn): ai khám phá nhiều dapp nhất / streak dài nhất.
- **Chia sẻ X tự động tạo caption**: ví dụ *"Hôm nay vòng quay Ritual đưa mình đến [Tên dapp] của @[handle] — dapp này dùng [X precompile] để [use case]. #RitualChain"*.

---

## 7. Yêu cầu cho AI khi build (nhắc lại nguyên tắc)

- Không tự bịa thông tin builder/dapp nếu không có dữ liệu — nếu thiếu, để trống hoặc ghi "chưa có thông tin công khai", tuyệt đối không tạo X handle giả hoặc số liệu giả.
- Giao diện tối giản, tông màu tối (dark, tech, hơi huyền bí — hợp với branding "Ritual" và hình ảnh sứa Turritopsis dohrnii mà team Ritual hay dùng làm biểu tượng "trường sinh").
- Mobile-first vì cộng đồng testnet thường tương tác qua điện thoại.
- Ưu tiên MVP chạy được với dữ liệu tĩnh (JSON) trước khi làm phần crawl tự động.

---

## 8. Việc cần AI builder làm ngay (bước đầu tiên)

1. Dựng UI trang chủ + vòng quay + card kết quả (dùng dữ liệu mẫu giả lập 5-8 dapp).
2. Viết prompt hệ thống cho phần AI phân tích dapp (dựa system context ở mục 2).
3. Viết cấu trúc JSON chuẩn cho 1 dapp entry và 1 kết quả phân tích AI.
4. Làm cơ chế giới hạn 1 lần/ngày + lưu lịch sử cục bộ.
5. Để lại TODO rõ ràng cho các phần: đăng nhập ví, submit dapp, crawl tự động.
