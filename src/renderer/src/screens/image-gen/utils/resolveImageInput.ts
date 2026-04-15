import { falService } from '../../../services/fal.service';

export async function resolveImageInput(image: string | null, label: string) {
  if (!image) return null;
  if (!image.startsWith('data:')) return image;

  const result = await falService.uploadImageFromDataUrl(image);
  if (result.error) {
    throw new Error(`${label} upload failed: ${result.error}`);
  }

  return result.url ?? null;
}
