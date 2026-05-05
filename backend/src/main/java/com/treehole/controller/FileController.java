package com.treehole.controller;

import com.treehole.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

/**
 * 文件上传 Controller（独立模块，与业务无耦合）
 */
@Slf4j
@RestController
@RequestMapping("/api/file")
public class FileController {

    /** 上传目录，默认为项目根目录下的 uploads/ 文件夹 */
    @Value("${app.upload.path:./uploads/}")
    private String uploadPath;

    /** 前端访问前缀 */
    @Value("${app.upload.url-prefix:/uploads/}")
    private String urlPrefix;

    /** 允许上传的文件类型 */
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "audio/webm", "audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg");

    /** 最大文件大小：5MB */
    private static final long MAX_SIZE = 5 * 1024 * 1024L;

    /**
     * 上传图片
     *
     * @param file 图片文件
     * @return 可访问的图片 URL
     */
    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        // 校验文件非空
        if (file.isEmpty()) {
            return Result.error(400, "请选择文件");
        }
        // 校验文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return Result.error(400, "不支持的文件格式");
        }
        // 校验文件大小
        if (file.getSize() > MAX_SIZE) {
            return Result.error(400, "图片大小不能超过 5MB");
        }

        // 生成唯一文件名，保留原始后缀
        String originalName = file.getOriginalFilename();
        String suffix = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf("."))
                : ".jpg";
        String newFileName = UUID.randomUUID().toString().replace("-", "") + suffix;

        // 确保上传目录存在
        File dir = new File(uploadPath).getAbsoluteFile();
        if (!dir.exists() && !dir.mkdirs()) {
            log.error("创建上传目录失败: {}", dir.getAbsolutePath());
            return Result.error("服务器存储目录创建失败");
        }

        // 保存文件
        File dest = new File(dir, newFileName);
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            log.error("文件保存失败: {}", e.getMessage(), e);
            return Result.error("文件保存失败，请稍后重试");
        }

        // 返回前端可访问的 URL
        String accessUrl = urlPrefix + newFileName;
        log.info("文件上传成功: {} -> {}", newFileName, dest.getAbsolutePath());
        return Result.success(accessUrl);
    }
}
