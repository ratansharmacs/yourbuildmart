package com.yourbuildmart.requests.repository;

import com.yourbuildmart.requests.entity.InquiryRequest;
import com.yourbuildmart.requests.entity.InquiryRequest.InquiryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRequestRepository extends JpaRepository<InquiryRequest, Long> {

    Page<InquiryRequest> findByType(InquiryType type, Pageable pageable);

    List<InquiryRequest> findByEmailOrderByCreatedAtDesc(String email);
}
