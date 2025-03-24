// (C) 2024-2025 GoodData Corporation
// The requested module is a CommonJS module, which may not support all module.exports as named exports.
import pkg from "lz-string";
const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = pkg;

/**
 * Compresses data to a URL-safe string
 *
 * @param data - Data to compress
 * @returns Compressed data string suitable for URL parameters
 * @public
 */
export function compressForUrl<T>(data: T): string {
    return compressToEncodedURIComponent(JSON.stringify(data));
}

/**
 * Decompresses data from a URL-safe string
 *
 * @param compressedData - Compressed data string from URL
 * @returns The decompressed data object or undefined if decompression fails
 * @public
 */
export function decompressFromUrl<T>(compressedData: string): T | undefined {
    try {
        const decompressedData = decompressFromEncodedURIComponent(compressedData);
        return decompressedData ? (JSON.parse(decompressedData) as T) : undefined;
    } catch (error) {
        console.error("Error decompressing data from URL:", error);
        return undefined;
    }
}
