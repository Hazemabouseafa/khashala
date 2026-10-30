'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle2, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UploadedImageInfo {
  url: string;
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
  width: number;
  height: number;
  format: string;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (imageUrls: string[]) => void;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxFiles = 8,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressionHistory, setCompressionHistory] = useState<UploadedImageInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const availableSlots = maxFiles - images.length;
    if (fileList.length > availableSlots) {
      setError(`يمكنك إضافة ${availableSlots} صور إضافية كحد أقصى (الحد الأقصى ${maxFiles} صور)`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('images', fileList[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل رفع الصور');
      }

      if (data.images && data.images.length > 0) {
        const newUrls = data.images.map((img: UploadedImageInfo) => img.url);
        onChange([...images, ...newUrls]);
        setCompressionHistory((prev) => [...prev, ...data.images]);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء معالجة الصور');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const formatKB = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isUploading
            ? 'border-brand-400 bg-brand-50/50 cursor-wait'
            : 'border-slate-300 hover:border-brand-500 hover:bg-slate-50/80 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading || images.length >= maxFiles}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              {isUploading
                ? 'جاري ضغط الصور وتحويلها لصيغة WebP المحسنة عبر Sharp...'
                : 'اسحب الصور وأفلتها هنا أو انقر للاختيار'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              مسموح حتى {maxFiles} صور • يدعم JPG, PNG, WebP • يتم الضغط تلقائياً لأقل من 300KB
            </p>
          </div>

          {/* Sharp Feature Highlight Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام الضغط الذكي بتقنية Sharp (WebP 80% • أقصى عرض 1200px)</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((imgUrl, index) => {
              // Find compression stats for this image if available
              const stats = compressionHistory.find((h) => h.url === imgUrl);

              return (
                <motion.div
                  key={imgUrl}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square flex flex-col justify-between"
                >
                  <img
                    src={imgUrl}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute top-2 left-2 w-7 h-7 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Primary Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      الرئيسية
                    </div>
                  )}

                  {/* Compression Info Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-navy-900/85 backdrop-blur-xs text-white p-2 text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-emerald-400">WebP محسن</span>
                      {stats && <span>-{stats.reductionPercentage}%</span>}
                    </div>
                    {stats && (
                      <div className="text-slate-300 text-[9px] flex justify-between">
                        <span>{formatKB(stats.compressedSize)}</span>
                        <span>{stats.width}x{stats.height}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
