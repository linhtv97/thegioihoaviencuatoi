import sharp from "sharp";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadConfig() {
  const raw = await readFile(path.join(__dirname, "config.json"), "utf-8");
  return JSON.parse(raw);
}

function isSupportedImage(filename, formats) {
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  return formats.includes(ext);
}

function buildOutputFilename(original, config) {
  const ext = path.extname(original);
  const base = path.basename(original, ext);
  const suffix = config.output.suffix || "";

  if (config.output.format === "auto" || !config.output.format) {
    return `${base}${suffix}${ext}`;
  }
  return `${base}${suffix}.${config.output.format}`;
}

async function processImage(inputPath, outputPath, config) {
  let pipeline = sharp(inputPath);

  const metadata = await sharp(inputPath).metadata();

  if (config.crop.enabled) {
    const cropLeft = Math.min(config.crop.left, metadata.width - 1);
    const cropTop = Math.min(config.crop.top, metadata.height - 1);
    const cropWidth = Math.min(config.crop.width, metadata.width - cropLeft);
    const cropHeight = Math.min(config.crop.height, metadata.height - cropTop);

    pipeline = pipeline.extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    });
  }

  if (config.resize.enabled) {
    pipeline = pipeline.resize({
      width: config.resize.width,
      height: config.resize.height,
      fit: config.resize.fit || "cover",
    });
  }

  const outputFormat = config.output.format;
  const quality = config.output.quality || 90;

  if (outputFormat && outputFormat !== "auto") {
    pipeline = pipeline.toFormat(outputFormat, { quality });
  } else {
    const ext = path.extname(inputPath).toLowerCase().replace(".", "");
    const formatMap = {
      jpg: "jpeg",
      jpeg: "jpeg",
      png: "png",
      webp: "webp",
      avif: "avif",
      tiff: "tiff",
    };
    const fmt = formatMap[ext];
    if (fmt) {
      pipeline = pipeline.toFormat(fmt, { quality });
    }
  }

  await pipeline.toFile(outputPath);
}

async function main() {
  const config = await loadConfig();

  const inputDir = path.resolve(__dirname, config.inputDir);
  const outputDir = path.resolve(__dirname, config.outputDir);

  if (!existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    console.error('Create the folder and add images, or update "inputDir" in config.json');
    process.exit(1);
  }

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  const files = await readdir(inputDir);
  const images = files.filter((f) => isSupportedImage(f, config.supported_formats));

  if (images.length === 0) {
    console.log("No supported images found in input directory.");
    console.log(`Supported formats: ${config.supported_formats.join(", ")}`);
    return;
  }

  console.log(`\nFound ${images.length} image(s) to process`);
  console.log(`Crop: ${config.crop.enabled ? `${config.crop.width}x${config.crop.height} at (${config.crop.left},${config.crop.top})` : "disabled"}`);
  console.log(`Resize: ${config.resize.enabled ? `${config.resize.width}x${config.resize.height} (${config.resize.fit})` : "disabled"}`);
  console.log(`Quality: ${config.output.quality}%`);
  console.log(`Output format: ${config.output.format || "auto"}\n`);

  let success = 0;
  let failed = 0;

  for (const file of images) {
    const inputPath = path.join(inputDir, file);
    const outputFilename = buildOutputFilename(file, config);
    const outputPath = path.join(outputDir, outputFilename);

    try {
      await processImage(inputPath, outputPath, config);
      console.log(`  OK  ${file} -> ${outputFilename}`);
      success++;
    } catch (err) {
      console.error(`  FAIL  ${file}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
