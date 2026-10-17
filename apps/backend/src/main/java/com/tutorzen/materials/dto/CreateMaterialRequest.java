package com.tutorzen.materials.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMaterialRequest(
    @NotBlank(message = "Subject ID is required")
    String subjectId,

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    String title,

    String description,

    @NotBlank(message = "File name is required")
    String fileName,

    String fileType,

    long fileSizeBytes,

    String fileUrl
) {
}

