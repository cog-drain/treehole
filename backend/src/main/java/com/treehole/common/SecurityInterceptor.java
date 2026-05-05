package com.treehole.common;

import com.treehole.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.lang.NonNull;

@Component
@RequiredArgsConstructor
public class SecurityInterceptor implements HandlerInterceptor {

    private final AdminService adminService;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        // 仅拦截写操作 (POST, PUT, DELETE)
        String method = request.getMethod();
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            String ip = request.getRemoteAddr();
            if (adminService.isIPBanned(ip)) {
                // 如果是黑名单 IP，抛出业务异常或直接拦截
                throw new BusinessException("你的访问权限已被限制 (IP: " + ip + ")");
            }
        }
        return true;
    }
}
