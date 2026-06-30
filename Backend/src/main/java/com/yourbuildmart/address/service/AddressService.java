package com.yourbuildmart.address.service;

import com.yourbuildmart.address.dto.request.AddressRequest;
import com.yourbuildmart.address.dto.response.AddressResponse;
import java.util.List;

public interface AddressService {
    AddressResponse add(String email, AddressRequest request);
    AddressResponse update(String email, Long addressId, AddressRequest request);
    List<AddressResponse> getAll(String email);
    void delete(String email, Long addressId);
    void setDefault(String email, Long addressId);
}
