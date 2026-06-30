package com.yourbuildmart.admin.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * Dashboard statistics returned to the admin UI.
 */
@Data
@Builder
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private long totalCategories;
    private long totalBrands;
    private long pendingOrders;
    private double totalRevenue;

    // Chart data
    // Category-wise: [{name, productCount, totalStock}]
    private List<CategoryStat> categoryStats;

    // Top 12 products by stock or recency
    private List<TopProduct> topProducts;

    // Product distribution (admin vs published vs seller)
    private long publishedProducts;
    private long adminProducts;
    private long sellerProducts;

    @Data
    @Builder
    public static class CategoryStat {
        private String name;
        private long productCount;
        private long totalStock;
    }

    @Data
    @Builder
    public static class TopProduct {
        private Long id;
        private String name;
        private String imageUrl;
        private double price;
        private double averageRating;
        private int reviewCount;
        private String slug;
        private String category;
    }
}
