"use client";

import { useEffect, useRef, useState } from "react";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageEditor({
  imageUrl,
  onSave,
  onCancel,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [crop, setCrop] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw image on canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate image dimensions to fit canvas
    const aspectRatio = image.width / image.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (aspectRatio > 1) {
      drawHeight = canvas.width / aspectRatio;
    } else {
      drawWidth = canvas.height * aspectRatio;
    }

    // Apply brightness and contrast filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Draw image centered
    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );

    ctx.restore();

    // Draw crop rectangle if cropping
    if (crop && !isCropping) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
      ctx.setLineDash([]);
    }
  }, [image, rotation, zoom, brightness, contrast, crop, isCropping]);

  // Handle mouse events for cropping
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsCropping(true);
    setCropStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCrop({
      x: Math.min(cropStart.x, x),
      y: Math.min(cropStart.y, y),
      width: Math.abs(x - cropStart.x),
      height: Math.abs(y - cropStart.y),
    });
  };

  const handleMouseUp = () => {
    setIsCropping(false);
  };

  // Apply crop
  const applyCrop = () => {
    if (!crop || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = crop.width;
    tempCanvas.height = crop.height;

    // Copy the cropped region
    const imageData = ctx.getImageData(crop.x, crop.y, crop.width, crop.height);
    tempCtx.putImageData(imageData, 0, 0);

    // Create new image from cropped canvas
    const croppedImg = new Image();
    croppedImg.onload = () => {
      setImage(croppedImg);
      setCrop(null);
      setZoom(1);
    };
    croppedImg.src = tempCanvas.toDataURL();
  };

  // Reset crop
  const resetCrop = () => {
    setCrop(null);
  };

  // Rotate image
  const rotateImage = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  // Reset all adjustments
  const resetAll = () => {
    setRotation(0);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setCrop(null);
  };

  // Save edited image
  const handleSave = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6">
        <h3 className="mb-4 text-xl font-bold text-gray-900">تعديل الصورة</h3>

        {/* Canvas */}
        <div className="mb-4 flex justify-center">
          <canvas
            ref={canvasRef}
            className="cursor-crosshair border-2 border-gray-300 rounded"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Rotation */}
          <div className="flex items-center gap-4">
            <label className="w-24 text-sm font-medium text-gray-700">
              التدوير:
            </label>
            <button
              onClick={() => rotateImage(-90)}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              ↶ 90°
            </button>
            <button
              onClick={() => rotateImage(90)}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              ↷ 90°
            </button>
            <span className="text-sm text-gray-600">{rotation}°</span>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-4">
            <label className="w-24 text-sm font-medium text-gray-700">
              التكبير:
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="w-16 text-sm text-gray-600">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Brightness */}
          <div className="flex items-center gap-4">
            <label className="w-24 text-sm font-medium text-gray-700">
              السطوع:
            </label>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-16 text-sm text-gray-600">{brightness}%</span>
          </div>

          {/* Contrast */}
          <div className="flex items-center gap-4">
            <label className="w-24 text-sm font-medium text-gray-700">
              التباين:
            </label>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-16 text-sm text-gray-600">{contrast}%</span>
          </div>

          {/* Crop controls */}
          {crop && (
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">
                القص:
              </label>
              <button
                onClick={applyCrop}
                className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                تطبيق القص
              </button>
              <button
                onClick={resetCrop}
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                إلغاء القص
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={resetAll}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            إعادة تعيين
          </button>
          <button
            onClick={onCancel}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
