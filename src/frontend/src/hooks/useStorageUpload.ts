import { HttpAgent } from "@icp-sdk/core/agent";
import { useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function useStorageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<string> => {
    // --- Client-side validation ---
    if (!ALLOWED_TYPES.includes(file.type)) {
      const msg = "Only JPG and PNG images are allowed.";
      setUploadError(msg);
      throw new Error(msg);
    }
    if (file.size === 0) {
      const msg = "Cannot upload an empty file.";
      setUploadError(msg);
      throw new Error(msg);
    }
    if (file.size > MAX_SIZE_BYTES) {
      const msg = "Image must be under 5MB.";
      setUploadError(msg);
      throw new Error(msg);
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const config = await loadConfig();

      // Reuse the same agent setup as createActorWithConfig
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch((err) => {
          console.warn("[StorageUpload] Unable to fetch root key:", err);
        });
      }

      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      // Read file as bytes — preserve original File reference for correct MIME type
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (bytes.length === 0) {
        throw new Error("File read produced empty bytes — please try again.");
      }

      console.log(
        `[StorageUpload] Uploading ${file.name} (${file.type}, ${file.size} bytes)`,
      );

      const { hash } = await storageClient.putFile(
        bytes,
        file.type,
        onProgress,
      );
      const url = await storageClient.getDirectURL(hash);

      console.log("[StorageUpload] Upload successful. URL:", url);
      return url;
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      console.error("[StorageUpload] Full error:", err);

      // Surface a friendly message while preserving the full log
      const msg = rawMsg.includes("403")
        ? "Image upload failed (permission error). Please try again."
        : rawMsg.includes("payload")
          ? "Image upload failed (invalid data). Please re-select the image and try again."
          : "Image upload failed, please try again.";

      setUploadError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading, uploadError };
}
