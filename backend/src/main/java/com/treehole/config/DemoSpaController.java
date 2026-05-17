package com.treehole.config;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Profile("demo")
public class DemoSpaController {

    @GetMapping({
            "/",
            "/{path:^(?!api|uploads|ws|docs|v3).*$}",
            "/{path:^(?!api|uploads|ws|docs|v3).*$}/**"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
