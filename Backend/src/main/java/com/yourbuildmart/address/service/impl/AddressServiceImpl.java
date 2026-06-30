package com.yourbuildmart.address.service.impl;

import com.yourbuildmart.address.dto.request.AddressRequest;
import com.yourbuildmart.address.dto.response.AddressResponse;
import com.yourbuildmart.address.entity.Address;
import com.yourbuildmart.address.repository.AddressRepository;
import com.yourbuildmart.address.service.AddressService;
import com.yourbuildmart.exception.BadRequestException;
import com.yourbuildmart.exception.ResourceNotFoundException;
import com.yourbuildmart.user.entity.User;
import com.yourbuildmart.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository    userRepository;

    @Override
    @Transactional
    public AddressResponse add(String email, AddressRequest request) {
        User user = getUser(email);

        // If this is the first address, auto-set as default
        boolean isFirst = addressRepository.findByUser(user).isEmpty();

        Address address = buildAddress(new Address(), request, user);
        address.setDefault(request.isDefault() || isFirst);

        if (address.isDefault()) {
            clearDefaultForUser(user);
        }

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse update(String email, Long addressId, AddressRequest request) {
        User    user    = getUser(email);
        Address address = getAddressForUser(user, addressId);

        buildAddress(address, request, user);

        if (request.isDefault()) {
            clearDefaultForUser(user);
            address.setDefault(true);
        }

        return toResponse(addressRepository.save(address));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAll(String email) {
        User user = getUser(email);
        return addressRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(String email, Long addressId) {
        User    user    = getUser(email);
        Address address = getAddressForUser(user, addressId);
        addressRepository.delete(address);
    }

    @Override
    @Transactional
    public void setDefault(String email, Long addressId) {
        User    user    = getUser(email);
        Address address = getAddressForUser(user, addressId);
        clearDefaultForUser(user);
        address.setDefault(true);
        addressRepository.save(address);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    private Address getAddressForUser(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Address does not belong to the current user");
        }
        return address;
    }

    private void clearDefaultForUser(User user) {
        addressRepository.findByUserAndIsDefaultTrue(user)
                .ifPresent(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private Address buildAddress(Address a, AddressRequest r, User user) {
        a.setUser(user);
        a.setFullName(r.getFullName());
        a.setPhone(r.getPhone());
        a.setAddressLine1(r.getAddressLine1());
        a.setAddressLine2(r.getAddressLine2());
        a.setCity(r.getCity());
        a.setState(r.getState());
        a.setCountry(r.getCountry());
        a.setPostalCode(r.getPostalCode());
        if (r.getAddressType() != null) {
            try {
                a.setAddressType(Address.AddressType.valueOf(r.getAddressType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                a.setAddressType(Address.AddressType.HOME);
            }
        }
        return a;
    }

    private AddressResponse toResponse(Address a) {
        return AddressResponse.builder()
                .id(a.getId())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .addressLine1(a.getAddressLine1())
                .addressLine2(a.getAddressLine2())
                .city(a.getCity())
                .state(a.getState())
                .country(a.getCountry())
                .postalCode(a.getPostalCode())
                .isDefault(a.isDefault())
                .addressType(a.getAddressType() != null ? a.getAddressType().name() : null)
                .build();
    }
}
