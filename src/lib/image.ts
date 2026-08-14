export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 1600;
export const IMAGE_QUALITY = 0.82;

export function isAllowedImage(file: File): boolean {
  const typeOk = ALLOWED_IMAGE_TYPES.includes(file.type);
  const extOk = /\.(jpe?g|png|webp)$/i.test(file.name);
  return typeOk || extOk;
}

export async function optimizeImage(file: File): Promise<{ blob: Blob; ext: string; contentType: string }> {
  if (!isAllowedImage(file)) {
    throw new Error('Yalnızca JPG, JPEG, PNG veya WEBP yükleyebilirsiniz.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Dosya boyutu 5 MB sınırını aşıyor.');
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return { blob: file, ext: extensionOf(file), contentType: file.type || 'image/jpeg' };
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Görsel sıkıştırılamadı.'));
        },
        'image/jpeg',
        IMAGE_QUALITY
      );
    });

    return { blob, ext: 'jpg', contentType: 'image/jpeg' };
  } catch {
    return { blob: file, ext: extensionOf(file), contentType: file.type || 'image/jpeg' };
  }
}

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName === 'jpeg') return 'jpg';
  if (fromName === 'jpg' || fromName === 'png' || fromName === 'webp') return fromName;
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  return 'jpg';
}
