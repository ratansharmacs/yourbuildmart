package com.yourbuildmart.blog.repository;

import com.yourbuildmart.blog.entity.BlogCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogCategoryRepository extends JpaRepository<BlogCategory, Long> {
    boolean existsByNameIgnoreCase(String name);
}
