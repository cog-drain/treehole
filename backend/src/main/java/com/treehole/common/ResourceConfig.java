package com.treehole.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * 静态资源配置：将本地上传目录映射为可通过 HTTP 访问的静态资源路径
 * 与 CorsConfig 分离，单一职责
 */
@Configuration
public class ResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.path:./uploads/}")
    private String uploadPath;

    @Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 将 /uploads/** 请求映射到本地文件系统的上传目录
        String absolutePath = new File(uploadPath).getAbsolutePath();
        registry.addResourceHandler(urlPrefix + "**")
                .addResourceLocations("file:" + absolutePath + File.separator);
    }
}
