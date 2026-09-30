import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { adminApi } from "@/services/api/index";
export const ImageUploader = ({
  images,
  onChange,
  multiple = false,
  label = "Upload Image",
  helperText = "PNG, JPG, WEBP, or AVIF up to 10MB.",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [manualUrl, setManualUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);
  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);
    setIsUploading(true);
    try {
      if (multiple) {
        const fileArr = Array.from(files);
        const res = await adminApi.uploadImages(fileArr);
        if (res.success && res.data) {
          const uploadedUrls = Array.isArray(res.data)
            ? res.data.map((d) => d.url)
            : [res.data.url];
          onChange([...images, ...uploadedUrls]);
        } else {
          setErrorMessage(res.message || "Failed to upload images.");
        }
      } else {
        const file = files[0];
        const res = await adminApi.uploadImage(file);
        if (res.success && res.data?.url) {
          onChange([res.data.url]);
        } else {
          setErrorMessage(res.message || "Failed to upload image.");
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected upload error occurred.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleRemove = async (indexToRemove) => {
    const urlToRemove = images[indexToRemove];
    const newImages = images.filter((_, i) => i !== indexToRemove);
    onChange(newImages);
    // If it was an uploaded file, asynchronously attempt cleanup
    if (urlToRemove && urlToRemove.startsWith("/images/uploads/")) {
      try {
        await adminApi.deleteUploadedImage(urlToRemove);
      } catch {
        // Ignore deletion failures
      }
    }
  };
  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };
  const handleMove = (index, direction) => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    onChange(newImages);
  };
  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (multiple) {
      onChange([...images, trimmed]);
    } else {
      onChange([trimmed]);
    }
    setManualUrl("");
    setShowUrlInput(false);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-serif tracking-widest text-[#780C28] uppercase font-bold">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-[#8B1E3F] hover:text-[#50071B] underline font-medium flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? "Hide Direct URL" : "Paste Image URL"}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 p-2 bg-[#FFFBF7] border border-[#E8DCC4] rounded-lg">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="/images/example.png or https://..."
            className="flex-1 text-xs px-3 py-1.5 border border-stone-300 rounded bg-white focus:outline-none focus:border-[#780C28]"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="px-3 py-1.5 bg-[#780C28] text-white text-xs font-medium rounded hover:bg-[#50071B] transition-colors"
          >
            Add URL
          </button>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed border-[#D4AF37]/50 rounded-xl p-6 text-center cursor-pointer transition-all ${isUploading ? "bg-stone-50 opacity-70 pointer-events-none" : "hover:border-[#780C28] hover:bg-[#FFFDF9]"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Loader2 className="w-8 h-8 text-[#780C28] animate-spin" />
            <p className="text-xs text-stone-600 font-medium">
              Uploading imagery to luxury atelier storage...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#FFF5EC] border border-[#D4AF37]/40 flex items-center justify-center text-[#780C28]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-800">
                Click to browse or drag & drop high-res imagery
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">{helperText}</p>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Previews & Management */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((imgUrl, idx) => (
            <div
              key={`${imgUrl}-${idx}`}
              className="group relative border border-[#E8DCC4] rounded-lg overflow-hidden bg-white shadow-sm flex flex-col"
            >
              <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden flex items-center justify-center">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-stone-300" />
                )}

                {/* Primary Badge */}
                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#780C28] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" /> Primary
                  </span>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow hover:bg-red-700 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Multiple Controls */}
              {multiple && images.length > 1 && (
                <div className="p-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px]">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "left")}
                      className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                      title="Move backward"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, "right")}
                      className="p-1 rounded hover:bg-stone-200 disabled:opacity-30"
                      title="Move forward"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="text-[#780C28] font-medium hover:underline text-[10px]"
                    >
                      Make Primary
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
