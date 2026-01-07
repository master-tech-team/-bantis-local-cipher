/**
 * Compression utilities using CompressionStream API
 */

/**
 * Check if compression is supported
 */
export function isCompressionSupported(): boolean {
    return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
}

/**
 * Compress a string using gzip
 */
export async function compress(data: string): Promise<Uint8Array> {
    if (!isCompressionSupported()) {
        // Fallback: return uncompressed data with marker
        const encoder = new TextEncoder();
        return encoder.encode(data);
    }

    try {
        const encoder = new TextEncoder();
        const stream = new Blob([data]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        const compressedBlob = await new Response(compressedStream).blob();
        const buffer = await compressedBlob.arrayBuffer();
        return new Uint8Array(buffer);
    } catch (error) {
        console.warn('Compression failed, returning uncompressed data:', error);
        const encoder = new TextEncoder();
        return encoder.encode(data);
    }
}

/**
 * Decompress gzip data to string
 */
export async function decompress(data: Uint8Array): Promise<string> {
    if (!isCompressionSupported()) {
        // Fallback: assume uncompressed
        const decoder = new TextDecoder();
        return decoder.decode(data);
    }

    try {
        const stream = new Blob([data]).stream();
        const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
        const decompressedBlob = await new Response(decompressedStream).blob();
        return await decompressedBlob.text();
    } catch (error) {
        // If decompression fails, try to decode as plain text
        console.warn('Decompression failed, trying plain text:', error);
        const decoder = new TextDecoder();
        return decoder.decode(data);
    }
}

/**
 * Check if data should be compressed based on size
 */
export function shouldCompress(data: string, threshold: number = 1024): boolean {
    return data.length >= threshold;
}

/**
 * Get compression ratio
 */
export function getCompressionRatio(original: number, compressed: number): number {
    return compressed / original;
}
