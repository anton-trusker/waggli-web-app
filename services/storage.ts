
import { supabase } from "./supabase";
import { decode } from 'base64-arraybuffer';

/**
 * Uploads a file to Supabase Storage.
 * @param file The file object (from input[type="file"]).
 * @param path The folder path (e.g., 'users/userId/avatar' or 'documents/petId').
 * @returns Object containing the public URL and the full storage path.
 */
export const uploadFile = async (file: File, path: string): Promise<{ url: string; fullPath: string }> => {
  const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const fullPath = `${path}/${uniqueName}`;
  const bucket = 'waggly-storage'; // Ensure this bucket exists in Supabase

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fullPath);

  return { url: publicUrl, fullPath };
};

/**
 * Deletes a file from Supabase Storage.
 * @param fullPath The full path stored in the DB (e.g. 'documents/petId/filename.jpg').
 */
export const deleteFile = async (fullPath: string): Promise<void> => {
  if (!fullPath) return;
  const bucket = 'waggly-storage';
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fullPath]);

  if (error) console.warn("Error deleting file from storage:", error);
};

/**
 * Uploads a Base64 string as an image (useful for AI generated avatars).
 */
export const uploadBase64 = async (base64Data: string, path: string): Promise<string> => {
  const bucket = 'waggly-storage';
  const uniqueName = `${Date.now()}.png`;
  const fullPath = `${path}/${uniqueName}`;

  // Convert data URL to ArrayBuffer if needed, or stripping header
  const base64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, decode(base64), {
      contentType: 'image/png'
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fullPath);

  return publicUrl;
};
