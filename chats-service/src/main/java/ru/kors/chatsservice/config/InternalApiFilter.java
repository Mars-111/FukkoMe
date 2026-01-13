//package ru.kors.chatsservice.config;
//
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.ServletRequest;
//import jakarta.servlet.ServletResponse;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.GenericFilterBean;
//
//import java.io.IOException;
//import java.util.Collections;
//import java.util.Set;
//
//@Component
//public class InternalApiFilter extends GenericFilterBean {
//
//    // Разрешенные IP-адреса (локальный сервис на порту 9082)
//    private static final Set<String> ALLOWED_IPS = Collections.unmodifiableSet(Set.of("127.0.0.1", "0:0:0:0:0:0:0:1", "109.228.70.130", "mars-ssn.ru")); // IPv4 и IPv6 localhost
//
//    @Override
//    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
//            throws IOException, ServletException {
//        HttpServletRequest httpRequest = (HttpServletRequest) request;
//
//        // Проверяем, нужно ли фильтровать этот запрос (только internal API)
//        String requestURI = httpRequest.getRequestURI();
//        if (requestURI.startsWith("/internal/")) {
//            HttpServletResponse httpResponse = (HttpServletResponse) response;
//            String clientIp = getClientIp(httpRequest);
//            System.out.println("Request to internal API from IP: " + clientIp);
//
//
//            if (!ALLOWED_IPS.contains(clientIp)) {
//                System.out.println("Access Denied for IP: " + clientIp);
//                httpResponse.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
//                return;
//            }
//        }
//
//        chain.doFilter(request, response);
//    }
//
//    // Получение реального IP с учетом прокси
//    private String getClientIp(HttpServletRequest request) {
//        String ip = request.getHeader("X-Forwarded-For"); // Проверяем, есть ли заголовок от прокси
//        if (ip == null || ip.isBlank()) {
//            ip = request.getRemoteAddr(); // Если нет, берём обычный IP
//        }
//        return ip.split(",")[0].trim(); // Берём первый IP из списка (если их несколько)
//    }
//}