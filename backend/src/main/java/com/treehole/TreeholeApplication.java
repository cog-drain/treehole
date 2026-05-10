package com.treehole;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.treehole.mapper")
@EnableScheduling
@EnableCaching
public class TreeholeApplication {

	public static void main(String[] args) {
		SpringApplication.run(TreeholeApplication.class, args);
	}

}
