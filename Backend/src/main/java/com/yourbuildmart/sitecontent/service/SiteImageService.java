package com.yourbuildmart.sitecontent.service;

import com.yourbuildmart.sitecontent.dto.response.SiteImageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface SiteImageService {

    /** All image slots, grouped by page, for the public site to consume in one call. */
    Map<String, List<SiteImageResponse>> getAllGroupedByPage();

    /** All image slots for the admin panel (flat list, includes ids). */
    List<SiteImageResponse> getAllForAdmin();

    SiteImageResponse updateUrl(Long id, String imageUrl);

    SiteImageResponse uploadImage(Long id, MultipartFile file);
}
