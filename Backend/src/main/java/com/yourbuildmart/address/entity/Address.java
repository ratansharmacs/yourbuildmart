package com.yourbuildmart.address.entity;

import com.yourbuildmart.common.util.BaseEntity;
import com.yourbuildmart.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(name = "address_line1", nullable = false)
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String country;

    @Column(name = "postal_code", nullable = false)
    private String postalCode;

    @Column(name = "is_default")
    @Builder.Default
    private boolean isDefault = false;

    @Column(name = "address_type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AddressType addressType = AddressType.HOME;

    public enum AddressType {
        HOME, WORK, OTHER, SITE
    }
}
