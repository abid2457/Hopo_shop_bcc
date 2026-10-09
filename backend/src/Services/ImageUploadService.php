<?php
declare(strict_types=1);

namespace HopoShop\Services;

use Exception;
use HopoShop\Config\Config;

require_once dirname(__DIR__, 2) . '/config/config.php';

class ImageUploadService
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => '.jpg',
        'image/png'  => '.png',
        'image/webp' => '.webp',
        'image/avif' => '.avif',
    ];

    private const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    public static function getUploadDirectory(): string
    {
        // Points to backend/public/uploads
        $uploadDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }
        return $uploadDir;
    }

    /**
     * Handles single file upload from $_FILES array entry.
     * 
     * @param array $fileEntry An element of $_FILES
     * @return array ['url' => string, 'filename' => string, 'size' => int, 'mime' => string]
     */
    public static function handleUpload(array $fileEntry): array
    {
        if (!isset($fileEntry['error']) || is_array($fileEntry['error'])) {
            throw new Exception('Invalid upload parameter format.');
        }

        switch ($fileEntry['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                throw new Exception('No image file was provided.');
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception('Image file exceeded maximum allowed upload size.');
            default:
                throw new Exception('An error occurred while uploading the image file.');
        }

        if ($fileEntry['size'] > self::MAX_FILE_SIZE_BYTES) {
            throw new Exception('Image size exceeds 10MB limit.');
        }

        $mimeType = self::detectMimeType($fileEntry['tmp_name'], $fileEntry['name'] ?? '');

        if (!isset(self::ALLOWED_MIME_TYPES[$mimeType])) {
            throw new Exception("Invalid image format '{$mimeType}'. Allowed formats: JPG, PNG, WEBP, AVIF.");
        }

        $extension = self::ALLOWED_MIME_TYPES[$mimeType];
        
        // Generate secure clean unique filename
        $cleanOriginalName = pathinfo($fileEntry['name'] ?? 'image', PATHINFO_FILENAME);
        $cleanSlug = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($cleanOriginalName));
        $cleanSlug = substr($cleanSlug, 0, 30);
        $uniqueName = 'hopo_' . $cleanSlug . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . $extension;

        $targetDir = self::getUploadDirectory();
        $targetPath = $targetDir . DIRECTORY_SEPARATOR . $uniqueName;

        if (!move_uploaded_file($fileEntry['tmp_name'], $targetPath)) {
            throw new Exception('Failed to save uploaded image to disk.');
        }

        // Standardized image path relative to web root (works across dev proxy, localhost, and production)
        $publicUrl = '/uploads/' . $uniqueName;

        return [
            'url'      => $publicUrl,
            'filename' => $uniqueName,
            'size'     => $fileEntry['size'],
            'mime'     => $mimeType,
        ];
    }

    /**
     * Deletes an uploaded image by public URL.
     */
    public static function deleteUpload(string $publicUrl): bool
    {
        $path = parse_url($publicUrl, PHP_URL_PATH) ?: $publicUrl;
        $filename = basename($path);
        
        // Prevent path traversal
        if (empty($filename) || preg_match('/[^a-zA-Z0-9_\.-]/', $filename)) {
            return false;
        }

        $filePath = self::getUploadDirectory() . DIRECTORY_SEPARATOR . $filename;
        if (file_exists($filePath)) {
            return @unlink($filePath);
        }

        return false;
    }

    private static function detectMimeType(string $path, string $originalName): string
    {
        // 1. Try finfo if available
        if (class_exists('\\finfo')) {
            try {
                $finfo = new \finfo(FILEINFO_MIME_TYPE);
                $mime = $finfo->file($path);
                if ($mime && isset(self::ALLOWED_MIME_TYPES[$mime])) {
                    return $mime;
                }
            } catch (\Throwable $e) {
                // Ignore and proceed
            }
        }

        // 2. Try getimagesize if available
        if (function_exists('getimagesize')) {
            $imgInfo = @getimagesize($path);
            if (!empty($imgInfo['mime']) && isset(self::ALLOWED_MIME_TYPES[$imgInfo['mime']])) {
                return $imgInfo['mime'];
            }
        }

        // 3. Inspect magic bytes
        $handle = @fopen($path, 'rb');
        if ($handle) {
            $bytes = fread($handle, 16);
            fclose($handle);
            if ($bytes !== false && strlen($bytes) >= 4) {
                if (substr($bytes, 0, 3) === "\xFF\xD8\xFF") {
                    return 'image/jpeg';
                }
                if (substr($bytes, 0, 8) === "\x89PNG\x0D\x0A\x1A\x0A") {
                    return 'image/png';
                }
                if (substr($bytes, 0, 4) === 'RIFF' && strpos($bytes, 'WEBP') !== false) {
                    return 'image/webp';
                }
                if (strpos($bytes, 'ftypavif') !== false || strpos($bytes, 'ftypavis') !== false) {
                    return 'image/avif';
                }
            }
        }

        // 4. Fallback based on extension
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $extMap = [
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'webp' => 'image/webp',
            'avif' => 'image/avif',
        ];

        return $extMap[$ext] ?? 'application/octet-stream';
    }
}
