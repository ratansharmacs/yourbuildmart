package com.yourbuildmart.sitecontent.service.impl;

import com.yourbuildmart.common.service.FileStorageService;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.sitecontent.dto.response.SiteImageResponse;
import com.yourbuildmart.sitecontent.entity.SiteImage;
import com.yourbuildmart.sitecontent.repository.SiteImageRepository;
import com.yourbuildmart.sitecontent.service.SiteImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteImageServiceImpl implements SiteImageService {

    private final SiteImageRepository siteImageRepository;
    private final FileStorageService  fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<SiteImageResponse>> getAllGroupedByPage() {
        return siteImageRepository.findAllByOrderByPageAscSlotKeyAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.groupingBy(SiteImageResponse::getPage));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteImageResponse> getAllForAdmin() {
        return siteImageRepository.findAllByOrderByPageAscSlotKeyAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SiteImageResponse updateUrl(Long id, String imageUrl) {
        SiteImage img = siteImageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteImage", "id", id));
        img.setImageUrl(imageUrl);
        siteImageRepository.save(img);
        log.info("[SITE-IMAGE] Updated {}/{} -> {}", img.getPage(), img.getSlotKey(), imageUrl);
        return toResponse(img);
    }

    @Override
    @Transactional
    public SiteImageResponse uploadImage(Long id, MultipartFile file) {
        SiteImage img = siteImageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteImage", "id", id));
        String url = fileStorageService.storeSiteImage(img.getPage(), file);
        img.setImageUrl(url);
        siteImageRepository.save(img);
        log.info("[SITE-IMAGE] Uploaded {}/{} -> {}", img.getPage(), img.getSlotKey(), url);
        return toResponse(img);
    }

    private SiteImageResponse toResponse(SiteImage img) {
        return SiteImageResponse.builder()
                .id(img.getId())
                .page(img.getPage())
                .slotKey(img.getSlotKey())
                .label(img.getLabel())
                .imageUrl(img.getImageUrl())
                .build();
    }
}
