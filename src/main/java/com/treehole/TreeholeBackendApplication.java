package com.treehole;

import org.mybatis.spring.annotation.MapperScan; // 导入这个
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.treehole.mapper") // 加上这行，告诉程序 Mapper 在哪
public class TreeholeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TreeholeBackendApplication.class, args);
	}

}
