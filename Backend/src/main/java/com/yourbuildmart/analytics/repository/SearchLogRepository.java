package com.yourbuildmart.analytics.repository;

import com.yourbuildmart.analytics.entity.SearchLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    /** All logs, newest first — with optional query filter. */
    @Query("SELECT s FROM SearchLog s WHERE (:q IS NULL OR LOWER(s.query) LIKE LOWER(CONCAT('%',:q,'%'))) ORDER BY s.createdAt DESC")
    Page<SearchLog> findFiltered(@Param("q") String q, Pageable pageable);

    /** Top N most-searched terms (case-insensitive). */
    @Query("SELECT LOWER(s.query) AS term, COUNT(s) AS cnt FROM SearchLog s GROUP BY LOWER(s.query) ORDER BY cnt DESC")
    List<Object[]> topQueries(Pageable pageable);

    /** Count of searches in a date range. */
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /** Unique searcher count (by userId — counts each user once; guests count separately). */
    @Query("SELECT COUNT(DISTINCT CASE WHEN s.userId IS NOT NULL THEN CAST(s.userId AS string) ELSE CONCAT('g-', s.id) END) FROM SearchLog s")
    long countUniqueSearchers();
}
