# 数据库参考手册 (Database Reference)

## 1. 实体关系图 (ER Diagram)

```mermaid
erDiagram
  USER ||--o{ MESSAGE : "creates"
  USER ||--o{ DRIFT_BOTTLE : "throws/picks"
  MESSAGE ||--o{ COMMENT : "contains"
  MESSAGE ||--o{ MESSAGE_TAG : "associates"
  TAG ||--o{ MESSAGE_TAG : "categorizes"

  MESSAGE {
    long id PK
    string user_id FK "Identity UUID"
    string content "BLOB/Text"
    string mood "Emoji/Text"
    string theme "UI Theme"
    int likes
    int comment_count
    json reactions "Emoji stats"
    datetime create_time
  }

  DRIFT_BOTTLE {
    long id PK
    string user_id FK "Owner"
    string content
    int state "0:Floating, 1:Picked, 2:Returned"
    string picker_id FK "Current Holder"
    string last_picker_id "Previous Holder"
    string reply_content "Latest Reply"
    string reply_author_alias
    datetime reply_time
    datetime update_time "Auto Update"
    datetime create_time
  }

  COMMENT {
    long id PK
    long message_id FK
    string user_id FK
    string content
    long parent_id "For nested replies"
    datetime create_time
  }
```

## 2. 核心表结构说明

### 2.1 drift_bottle (漂流瓶)
存储跨海洋的异步交互数据。

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | BIGINT | 主键，自增 |
| user_id | VARCHAR(36) | 瓶子所有者的 UUID |
| state | TINYINT | 状态 (0: 漂流中, 1: 被捞起, 2: 已归还) |
| picker_id | VARCHAR(36) | 当前捞起者的 UUID |
| update_time | DATETIME | 自动更新时间 (ON UPDATE CURRENT_TIMESTAMP) |
| create_time | DATETIME | 投掷时间 |

### 2.2 message (树洞留言)
匿名社区的核心数据载体。

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| user_id | VARCHAR(36) | 发布者 UUID |
| content | TEXT | 留言正文 |
| mood | VARCHAR(20) | 发布时的心情标识 |
| reactions | JSON | 动态表情点赞统计 |

## 3. 设计哲学
1. **去中心化身份**：不存储用户手机号、邮箱，仅通过客户端生成的 UUID (`user_id`) 进行逻辑绑定。
2. **时序优先**：所有核心表均包含 `create_time` 索引，确保“广场”和“回响中心”的查询性能。
3. **松耦合关联**：使用逻辑外键，避免数据库物理约束对大规模数据迁移的影响。
