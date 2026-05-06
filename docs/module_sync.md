# 模块开发文档 - 实时回响与离线同步 (Sync Engine)

## 1. 模块概述
本模块负责解决全栈应用中的“实时感”与“弱网可靠性”矛盾。通过 WebSocket 协议实现服务器主动推送（Push）以及基于本地存储的离线补偿机制，确保用户的心声在任何网络条件下都能安全送达。

## 2. 核心技术实现

### 2.1 WebSocket 实时推送
- **服务端实现**：基于 `jakarta.websocket` 标准。我们在 `WebSocketServer` 类中维护了一个线程安全的 `CopyOnWriteArraySet` 来存储活跃会话。
- **序列化优化**：配置了 `Jackson` 的 `JavaTimeModule`，解决了 `LocalDateTime` 对象在 WebSocket 传输过程中的 JSON 序列化冲突。
- **协议格式**：
  ```json
  {
    "type": "MESSAGE_REPLY",
    "payload": {
      "messageId": 1024,
      "content": "有人回应了你的心事...",
      "timestamp": "2026-05-06T16:50:00"
    }
  }
  ```

### 2.2 离线补偿引擎 (Offline Capsule)
针对移动端或极简环境，我们设计了 `offlineQueue.js`：
- **原理**：利用 Axios 拦截器捕获 `Network Error`，将失败的请求暂存在 `localStorage` 的 `treehole_offline_queue` 中。
- **补偿触发**：利用浏览器的 `online` 事件监听器，当网络恢复瞬间，自动启动队列消耗器（Consumer）进行递归重传。

## 3. 核心业务流程
1.  **用户发布**：前端调用 API 模块。
2.  **网络判定**：
    - **正常**：请求直达后端，写入 MySQL。
    - **断网**：数据自动存入离线胶囊，前端 UI 显示“离线封存中”。
3.  **实时扩散**：后端写入数据库成功后，触发 `ObserverService`，通过 WebSocket 将新动态广播给所有在线用户，实现“天涯若比邻”的实时互动。

## 4. 幂等性保障
为了防止网络抖动导致的重复发送，后端在接收离线补偿数据时，会根据 `content` 哈希值和时间戳进行短时去重校验。
