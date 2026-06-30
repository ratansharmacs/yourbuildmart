package com.yourbuildmart.order.entity;

import com.yourbuildmart.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    // ── Manual builder (DevTools RestartClassLoader-safe, replaces @Builder) ──

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Order     order;
        private Product   product;
        private Integer   quantity;
        private String    productName;
        private BigDecimal price;

        public Builder order(Order order)               { this.order       = order;       return this; }
        public Builder product(Product product)         { this.product     = product;     return this; }
        public Builder quantity(Integer quantity)       { this.quantity    = quantity;    return this; }
        public Builder productName(String productName)  { this.productName = productName; return this; }
        public Builder price(BigDecimal price)          { this.price       = price;       return this; }

        public OrderItem build() {
            OrderItem item = new OrderItem();
            item.order       = this.order;
            item.product     = this.product;
            item.quantity    = this.quantity;
            item.productName = this.productName;
            item.price       = this.price;
            return item;
        }
    }
}
