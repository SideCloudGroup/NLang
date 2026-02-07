# NLang

缩写查询站点：输入缩写可查询含义，支持一条缩写对应多条释义。管理后台供管理员维护词条。

## 技术栈

- 后端：Go + PocketBase（SQLite）
- 前端：React + Vite + Ant Design

## 部署

### 使用 Docker Compose (推荐)

1. 下载 `docker-compose.yml` 和 `config.example.toml`：

```bash
wget https://github.com/SideCloudGroup/NLang/raw/refs/heads/main/docker-compose.yml
```

2. 使用 Docker Compose 运行：

```bash
docker compose up -d
```

- 请查看运行后 Pocketbase 注册管理员账号的日志输出，改写URL后即可访问。
- PocketBase 管理后台：`http://URL_TO_APP/_/`
- API 与页面同源时无需配置；不同源时可通过环境变量 `NLANG_API_URL` 指定 API 根地址。
