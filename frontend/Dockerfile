# Stage 1: Build
FROM node:24-alpine AS build
WORKDIR /app

# 1. 替换 Alpine 软件源（加速 apk 下载）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 2. 安装 pnpm 并配置国内镜像源（加速 npm/pnpm 安装）
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./

# 3. 执行安装（frozen-lockfile 确保依赖版本与本地一致）
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build


# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
