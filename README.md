# Image Cropper

Tool cắt ảnh hàng loạt bằng Node.js + [sharp](https://sharp.pixelplumbing.com/).

## Cài đặt

```bash
cd image-cropper
npm install
```

## Cách dùng

1. Bỏ ảnh vào folder `input/`
2. Chỉnh config trong `config.json`
3. Chạy:

```bash
npm run crop
```

4. Ảnh đã cắt nằm trong folder `output/`

## Config (`config.json`)

| Field | Mô tả |
|---|---|
| `inputDir` | Folder chứa ảnh gốc (mặc định `./input`) |
| `outputDir` | Folder lưu ảnh đã cắt (mặc định `./output`) |
| `crop.enabled` | Bật/tắt crop |
| `crop.left` | Tọa độ X bắt đầu cắt (pixel, tính từ trái) |
| `crop.top` | Tọa độ Y bắt đầu cắt (pixel, tính từ trên) |
| `crop.width` | Chiều rộng vùng cắt (pixel) |
| `crop.height` | Chiều cao vùng cắt (pixel) |
| `resize.enabled` | Bật/tắt resize sau khi crop |
| `resize.width` | Chiều rộng resize |
| `resize.height` | Chiều cao resize |
| `resize.fit` | Cách fit: `cover`, `contain`, `fill`, `inside`, `outside` |
| `output.format` | Format xuất: `auto` (giữ nguyên), `jpeg`, `png`, `webp`, `avif` |
| `output.quality` | Chất lượng ảnh (1-100) |
| `output.suffix` | Hậu tố thêm vào tên file (vd: `_cropped`) |

## Ví dụ config

### Cắt vùng 800x600 từ góc trên trái

```json
{
  "crop": { "enabled": true, "left": 0, "top": 0, "width": 800, "height": 600 }
}
```

### Cắt + resize xuống 400x300

```json
{
  "crop": { "enabled": true, "left": 0, "top": 0, "width": 800, "height": 600 },
  "resize": { "enabled": true, "width": 400, "height": 300, "fit": "cover" }
}
```

### Chỉ resize (không crop)

```json
{
  "crop": { "enabled": false },
  "resize": { "enabled": true, "width": 500, "height": 500, "fit": "inside" }
}
```

### Chuyển tất cả sang WebP chất lượng 80%

```json
{
  "output": { "format": "webp", "quality": 80, "suffix": "" }
}
```

## Định dạng hỗ trợ

jpg, jpeg, png, webp, avif, tiff, gif
