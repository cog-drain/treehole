# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# 先复制 pom.xml 单独下载依赖，利用 Docker 层缓存
# 只要 pom.xml 不变，后续 src 改动不会重新下载依赖
COPY pom.xml .

# Use Aliyun mirror to speed up download in China
RUN mkdir -p /root/.m2 && \
    echo '<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" \
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
      xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd"> \
      <mirrors> \
        <mirror> \
          <id>aliyunmaven</id> \
          <mirrorOf>central</mirrorOf> \
          <name>aliyun maven</name> \
          <url>https://maven.aliyun.com/repository/public</url> \
        </mirror> \
      </mirrors> \
    </settings>' > /root/.m2/settings.xml

# 预下载依赖（利用层缓存）
RUN mvn dependency:go-offline -s /root/.m2/settings.xml -q

COPY src ./src
RUN mvn clean package -DskipTests -s /root/.m2/settings.xml -q && \
    rm target/*-original.jar || true

# Stage 2: Run — 使用 JRE 而非 JDK，镜像更小
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 1. 替换 Alpine 软件源（加速运行环境下的包安装）
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 2. 安装时区数据并设置（确保后端日志时间与数据库一致）
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    echo "Asia/Tokyo" > /etc/timezone && \
    apk del tzdata

COPY --from=build /app/target/*.jar app.jar

# 创建上传目录和日志目录 & 非 root 用户运行
RUN mkdir -p /app/uploads /app/logs && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app/uploads /app/logs
USER appuser

EXPOSE 24191
ENTRYPOINT ["java", "-jar", "app.jar"]
