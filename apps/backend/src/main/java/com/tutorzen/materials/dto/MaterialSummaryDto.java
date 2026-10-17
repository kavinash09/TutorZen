package com.tutorzen.materials.dto;

import java.time.Instant;

public record MaterialSummaryDto(
    String id,
    String subjectId,
    String subjectName,
    String title,
    String description,
    String fileName,
    String fileType,
    long fileSizeBytes,
    String fileUrl,
    String uploadedBy,
    String uploaderName,
    Instant createdAt
) {
}

