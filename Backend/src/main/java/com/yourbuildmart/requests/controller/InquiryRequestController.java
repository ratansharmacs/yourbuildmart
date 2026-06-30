package com.yourbuildmart.requests.controller;

import com.yourbuildmart.common.response.ApiResponse;
import com.yourbuildmart.requests.dto.request.AdminReplyRequest;
import com.yourbuildmart.requests.dto.request.AgentRequestSubmit;
import com.yourbuildmart.requests.dto.request.ContactRequestSubmit;
import com.yourbuildmart.requests.dto.response.InquiryRequestResponse;
import com.yourbuildmart.requests.service.InquiryRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InquiryRequestController {

    private final InquiryRequestService service;

    // ─── Public: submit ───────────────────────────────────────────────────────

    @PostMapping("/requests/agent")
    public ResponseEntity<ApiResponse<InquiryRequestResponse>> submitAgent(
            @RequestBody AgentRequestSubmit dto) {
        return ResponseEntity.ok(ApiResponse.success("Agent request submitted", service.submitAgent(dto)));
    }

    @PostMapping("/requests/contact")
    public ResponseEntity<ApiResponse<InquiryRequestResponse>> submitContact(
            @RequestBody ContactRequestSubmit dto) {
        return ResponseEntity.ok(ApiResponse.success("Contact request submitted", service.submitContact(dto)));
    }

    // ─── Admin: list / reply / discard ───────────────────────────────────────

    @GetMapping("/admin/requests")
    public ResponseEntity<ApiResponse<Page<InquiryRequestResponse>>> adminGetAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type) {
        Page<InquiryRequestResponse> result = (type != null && !type.isBlank())
                ? service.getAllByType(type, page, size)
                : service.getAll(page, size);
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    @PostMapping("/admin/requests/{id}/reply")
    public ResponseEntity<ApiResponse<InquiryRequestResponse>> reply(
            @PathVariable Long id,
            @RequestBody AdminReplyRequest dto) {
        return ResponseEntity.ok(ApiResponse.success("Reply sent", service.reply(id, dto)));
    }

    @PatchMapping("/admin/requests/{id}/discard")
    public ResponseEntity<ApiResponse<InquiryRequestResponse>> discard(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Request discarded", service.discard(id)));
    }

    // ─── Authenticated user: view own request replies ─────────────────────────

    @GetMapping("/requests/my")
    public ResponseEntity<ApiResponse<List<InquiryRequestResponse>>> myRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("OK",
                service.getMyRequests(userDetails.getUsername())));
    }
}
