package com.yourbuildmart.address.controller;

import com.yourbuildmart.address.dto.request.AddressRequest;
import com.yourbuildmart.address.dto.response.AddressResponse;
import com.yourbuildmart.address.service.AddressService;
import com.yourbuildmart.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Addresses", description = "Delivery address management")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Get all addresses for the current user")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAll(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved",
                addressService.getAll(user.getUsername())));
    }

    @PostMapping
    @Operation(summary = "Add a new address")
    public ResponseEntity<ApiResponse<AddressResponse>> add(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added",
                        addressService.add(user.getUsername(), request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing address")
    public ResponseEntity<ApiResponse<AddressResponse>> update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Address updated",
                addressService.update(user.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an address")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        addressService.delete(user.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted"));
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Set an address as the default shipping address")
    public ResponseEntity<ApiResponse<Void>> setDefault(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        addressService.setDefault(user.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated"));
    }
}
