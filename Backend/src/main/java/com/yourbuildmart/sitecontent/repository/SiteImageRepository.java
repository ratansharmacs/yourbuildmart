package com.yourbuildmart.sitecontent.repository;

import com.yourbuildmart.sitecontent.entity.SiteImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SiteImageRepository extends JpaRepository<SiteImage, Long> {
    List<SiteImage> findByPageOrderBySlotKeyAsc(String page);
    Optional<SiteImage> findByPageAndSlotKey(String page, String slotKey);
    List<SiteImage> findAllByOrderByPageAscSlotKeyAsc();
}
