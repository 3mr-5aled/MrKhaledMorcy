# Image Optimization System

## Overview

The system now automatically optimizes all uploaded images using Sharp library, reducing file sizes while maintaining quality.

## Features Implemented

### 1. **Automatic Image Optimization**

- **Format Conversion**: All images converted to WebP format for better compression
- **Resizing**: Images resized to max 1920x1080px (maintains aspect ratio)
- **Quality**: 85% quality setting for optimal balance
- **Compression**: Typically achieves 60-80% file size reduction

### 2. **Thumbnail Generation**

- Automatically creates 400x300px thumbnails for all images
- Uses "cover" fit mode for consistent thumbnail sizes
- Stored alongside optimized images

### 3. **Database Schema**

Added `thumbnails` field to Answer model:

```prisma
thumbnails   String[]     @default([]) // Array of thumbnail paths
```

### 4. **Next.js Image Optimization**

- Updated all image displays to use Next.js `<Image>` component
- Configured image formats, sizes, and caching
- Lazy loading and responsive images enabled

## Technical Details

### Upload Flow

1. User uploads image → Saved as temporary file
2. Sharp processes image:
   - Creates optimized version (WebP, max 1920x1080)
   - Creates thumbnail (WebP, 400x300)
3. Original file deleted
4. Optimized paths returned to client
5. Paths stored in database (`images` and `thumbnails` arrays)

### File Structure

```
public/answers/
  {gradeId}/
    {unitId}/
      {timestamp}-{filename}.webp       # Optimized image
      {timestamp}-{filename}-thumb.webp # Thumbnail
```

### API Response

Upload endpoint now returns:

```json
{
  "path": "/answers/grade-id/unit-id/image.webp",
  "thumbnail": "/answers/grade-id/unit-id/image-thumb.webp",
  "size": 245678,
  "originalSize": 1234567,
  "thumbnailSize": 12345,
  "reduction": 80,
  "type": "webp"
}
```

## Configuration

### Image Optimization Settings

Location: `src/lib/imageOptimization.ts`

```typescript
const DEFAULT_OPTIONS = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: "webp",
  thumbnailWidth: 400,
  thumbnailHeight: 300,
};
```

### Next.js Image Config

Location: `next.config.ts`

```typescript
images: {
  formats: ["image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

## User-Facing Changes

### Admin Panel

- Images display with Next.js Image component for optimization
- Thumbnails stored separately in database
- File size reductions logged in console

### Public Answers Page

- Shows ALL uploaded images (not just first one)
- Uses thumbnails for initial display
- Full images loaded on click
- Grid layout for multiple images

## Benefits

1. **Performance**: 60-80% smaller file sizes
2. **Bandwidth**: Reduced data transfer costs
3. **Speed**: Faster page loads
4. **UX**: Responsive images, lazy loading
5. **SEO**: Better Core Web Vitals scores

## Backward Compatibility

- Existing uploaded images continue to work
- System handles both old (JPG/PNG) and new (WebP) formats
- No migration needed for existing data
- New uploads automatically optimized

## File Deletion

When deleting an image:

- Main image deleted from server
- Associated thumbnail automatically deleted
- Empty directories cleaned up

## Future Enhancements

Consider implementing:

1. Batch optimization script for existing images
2. Multiple format generation (WebP + JPEG fallback)
3. Progressive image loading with blur placeholders
4. Image CDN integration
5. Advanced compression with multiple quality tiers

## Troubleshooting

### Sharp Installation Issues

If Sharp fails to install:

```bash
npm rebuild sharp
```

### Large Images Not Optimizing

Check the console for optimization errors. Increase Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

### Thumbnails Not Generating

Verify Sharp is installed correctly:

```bash
npm list sharp
```

## Performance Monitoring

Monitor optimization logs in terminal:

```
Image optimized: photo.jpg - Size reduced by 78% (1234567 → 245678 bytes)
```

## Dependencies

- **sharp**: `^0.33.x` - Image processing
- **Next.js**: `^16.x` - Image optimization component
