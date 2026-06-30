package com.yourbuildmart.requests.service;

import com.yourbuildmart.email.EmailService;
import com.yourbuildmart.email.dto.EmailRequest;
import com.yourbuildmart.email.enums.EmailType;
import com.yourbuildmart.requests.dto.request.AdminReplyRequest;
import com.yourbuildmart.requests.dto.request.AgentRequestSubmit;
import com.yourbuildmart.requests.dto.request.ContactRequestSubmit;
import com.yourbuildmart.requests.dto.response.InquiryRequestResponse;
import com.yourbuildmart.requests.entity.InquiryRequest;
import com.yourbuildmart.requests.repository.InquiryRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryRequestService {

    private final InquiryRequestRepository repo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // ─── Public submissions ───────────────────────────────────────────

    public InquiryRequestResponse submitAgent(AgentRequestSubmit dto) {
        InquiryRequest r = InquiryRequest.builder()
                .type(InquiryRequest.InquiryType.AGENT)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .shopName(dto.getShopName())
                .address(dto.getAddress())
                .password(passwordEncoder.encode(dto.getPassword()))
                .build();

        InquiryRequest saved = repo.save(r);

        // ── Email to user ─────────────────────────────────────────────
        emailService.sendEmail(EmailRequest.builder()
                .to(saved.getEmail())
                .userName(saved.getFirstName())
                .shopName(saved.getShopName())
                .emailType(EmailType.AGENT_CONFIRMATION)
                .build());

        // ── Email to admin ────────────────────────────────────────────
        emailService.sendEmail(EmailRequest.builder()
                .to("info@yourbuildmart.com")
                .userName(saved.getFirstName() + " " + saved.getLastName())
                .shopName(saved.getShopName())
                .userEmail(saved.getEmail())
                .userPhone(saved.getPhone())
                .userAddress(saved.getAddress())
                .emailType(EmailType.ADMIN_NEW_AGENT_ALERT)
                .build());

        return InquiryRequestResponse.from(saved);
    }

    public InquiryRequestResponse submitContact(ContactRequestSubmit dto) {
        InquiryRequest r = InquiryRequest.builder()
                .type(InquiryRequest.InquiryType.CONTACT)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .product(dto.getProduct())
                .quantity(dto.getQuantity())
                .country(dto.getCountry())
                .city(dto.getCity())
                .message(dto.getMessage())
                .build();

        InquiryRequest saved = repo.save(r);

        String userName = (saved.getFirstName() != null ? saved.getFirstName() : "") +
                (saved.getLastName() != null ? " " + saved.getLastName() : "");

        // ── Confirmation to user ──────────────────────────────────────────
        emailService.sendEmail(EmailRequest.builder()
                .to(saved.getEmail())
                .userName(saved.getFirstName())
                .contactProduct(saved.getProduct())
                .contactQuantity(saved.getQuantity())
                .contactCountry(saved.getCountry())
                .contactCity(saved.getCity())
                .contactMessage(saved.getMessage())
                .contactPhone(saved.getPhone())
                .emailType(EmailType.CONTACT_CONFIRMATION)
                .build());

        // ── Alert to admin ────────────────────────────────────────────────
        emailService.sendEmail(EmailRequest.builder()
                .to("info@yourbuildmart.com")
                .userName(userName.trim())
                .userEmail(saved.getEmail())
                .contactProduct(saved.getProduct())
                .contactQuantity(saved.getQuantity())
                .contactCountry(saved.getCountry())
                .contactCity(saved.getCity())
                .contactMessage(saved.getMessage())
                .contactPhone(saved.getPhone())
                .emailType(EmailType.ADMIN_NEW_CONTACT_ALERT)
                .build());

        return InquiryRequestResponse.from(saved);
    }

    // ─── Admin ────────────────────────────────────────────────────────

    public Page<InquiryRequestResponse> getAllByType(String type, int page, int size) {
        InquiryRequest.InquiryType t =
                InquiryRequest.InquiryType.valueOf(type.toUpperCase());
        return repo.findByType(t,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(InquiryRequestResponse::from);
    }

    public Page<InquiryRequestResponse> getAll(int page, int size) {
        return repo.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(InquiryRequestResponse::from);
    }

    public InquiryRequestResponse reply(Long id, AdminReplyRequest dto) {
        InquiryRequest r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found: " + id));
        r.setAdminReply(dto.getReply());
        r.setStatus(InquiryRequest.InquiryStatus.REPLIED);
        r.setRepliedAt(LocalDateTime.now());

        InquiryRequest saved = repo.save(r);

        // ── Email trigger ─────────────────────────────────────────────
        emailService.sendEmail(EmailRequest.builder()
                .to(saved.getEmail())
                .userName(saved.getFirstName())
                .adminReply(saved.getAdminReply())
                .emailType(EmailType.ADMIN_REPLY)
                .build());

        return InquiryRequestResponse.from(saved);
    }

    public InquiryRequestResponse discard(Long id) {
        InquiryRequest r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found: " + id));
        r.setStatus(InquiryRequest.InquiryStatus.DISCARDED);
        return InquiryRequestResponse.from(repo.save(r));
    }

    // ─── User view (by email) ─────────────────────────────────────────

    public List<InquiryRequestResponse> getMyRequests(String email) {
        return repo.findByEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(InquiryRequestResponse::from)
                .collect(Collectors.toList());
    }
}
