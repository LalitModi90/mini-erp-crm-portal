const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'i0vwvn7t';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'mini_erp_unsigned';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  url: string;
  asset_id: string;
}

export async function uploadImageToCloudinary(file: File, folder = 'mini_erp'): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = `Cloudinary upload failed (${response.status})`;
    try {
      const err = await response.json();
      if (err?.error?.message) message = err.error.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return response.json();
}

export function isConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}