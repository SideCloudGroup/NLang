# NLang

缩写查询站点：输入缩写可查询含义，支持一条缩写对应多条释义。管理后台供管理员维护词条。

## 部署

### 使用 Docker Compose (推荐)

1. 下载 `docker-compose.yml` 和 `config.toml`：

```bash
wget https://github.com/SideCloudGroup/NLang/raw/refs/heads/main/docker-compose.yml
wget https://github.com/SideCloudGroup/NLang/raw/refs/heads/main/config.example.toml -O config.toml
```

2. 使用 Docker Compose 运行：

```bash
docker compose up -d
```
