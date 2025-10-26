package com.servicefinder.config;

import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.ModelAndView;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@Configuration
public class SpaErrorViewResolver {

    @Bean
    public ErrorViewResolver spaForwarder() {
        return new ErrorViewResolver() {
            @Override
            public ModelAndView resolveErrorView(HttpServletRequest request, HttpStatus status, Map<String, Object> model) {
                String accept = request.getHeader("accept");
                Object uriAttr = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
                String path = uriAttr != null ? uriAttr.toString() : "";

                boolean isHtml = accept != null && accept.contains("text/html");
                boolean isApi = path.startsWith("/api/") || path.equals("/api")
                        || path.startsWith("/v3/") || path.startsWith("/swagger")
                        || path.startsWith("/actuator") || path.startsWith("/h2-console")
                        || path.startsWith("/assets") || path.startsWith("/webjars");

                if (status == HttpStatus.NOT_FOUND && isHtml && !isApi) {
                    return new ModelAndView("forward:/");
                }
                return null;
            }
        };
    }
} 