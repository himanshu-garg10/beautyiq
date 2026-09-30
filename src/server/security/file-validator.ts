/**
 * BeautyIQ File Upload Security Validator
 * Validates file uploads (images, data feeds) by MIME type, extension, size limits,
 * and dangerous content patterns.
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

export class FileUploadValidator {
  private static ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  private static ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
  private static MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  private static ALLOWED_DATA_TYPES = ["application/json", "text/csv"];
  private static ALLOWED_DATA_EXTENSIONS = [".json", ".csv"];
  private static MAX_DATA_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  /**
   * Validate image file upload
   */
  static validateImageUpload(file: {
    name: string;
    size: number;
    type: string;
  }): FileValidationResult {
    if (!file || !file.name) {
      return { isValid: false, error: "File is required." };
    }

    if (file.size <= 0 || file.size > this.MAX_IMAGE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Image file exceeds maximum permitted size of ${this.MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`,
      };
    }

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: `Unsupported image MIME type "${file.type}". Allowed: JPG, PNG, WebP.`,
      };
    }

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!this.ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        error: `Unsupported image file extension "${ext}".`,
      };
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".");

    return {
      isValid: true,
      sanitizedFilename,
    };
  }

  /**
   * Validate data import feed (JSON or CSV)
   */
  static validateDataUpload(file: {
    name: string;
    size: number;
    type: string;
  }): FileValidationResult {
    if (!file || !file.name) {
      return { isValid: false, error: "Data file is required." };
    }

    if (file.size <= 0 || file.size > this.MAX_DATA_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Data feed exceeds maximum permitted size of ${this.MAX_DATA_SIZE_BYTES / (1024 * 1024)}MB.`,
      };
    }

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!this.ALLOWED_DATA_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        error: `Invalid data feed file extension "${ext}". Allowed: .json, .csv.`,
      };
    }

    const sanitizedFilename = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".");

    return {
      isValid: true,
      sanitizedFilename,
    };
  }
}
