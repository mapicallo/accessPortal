import type { MessageKey } from './i18n.js';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 2048;

export type ImageParseFailure = 'too_large' | 'unsupported' | 'image_failed';

export type ParsedImage = {
  fileName: string;
  blob: Blob;
  mimeType: string;
  truncated: boolean;
  previewUrl: string;
};

export type ImageParseResult =
  | { ok: true; image: ParsedImage }
  | { ok: false; error: ImageParseFailure };

const IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

async function resizeImageBlob(file: File): Promise<{ blob: Blob; truncated: boolean }> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  let truncated = false;

  const maxDim = MAX_IMAGE_DIMENSION;
  if (width > maxDim || height > maxDim) {
    truncated = true;
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob'))),
      file.type === 'image/png' ? 'image/png' : 'image/jpeg',
      0.92,
    );
  });

  return { blob, truncated };
}

export async function parseImageFile(file: File): Promise<ImageParseResult> {
  if (!IMAGE_MIME.has(file.type) && !file.type.startsWith('image/')) {
    return { ok: false, error: 'unsupported' };
  }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'too_large' };

  try {
    const { blob, truncated } = await resizeImageBlob(file);
    const previewUrl = URL.createObjectURL(blob);
    return {
      ok: true,
      image: {
        fileName: file.name || 'image',
        blob,
        mimeType: blob.type,
        truncated,
        previewUrl,
      },
    };
  } catch {
    return { ok: false, error: 'image_failed' };
  }
}

export function revokeImagePreview(image: ParsedImage | null): void {
  if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
}

export function imageErrorMessage(
  error: ImageParseFailure,
  t: (key: MessageKey) => string,
): string {
  switch (error) {
    case 'too_large':
      return t('errorImageTooLarge');
    case 'unsupported':
      return t('errorImageUnsupported');
    default:
      return t('errorImageFailed');
  }
}
