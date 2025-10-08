import fs from "fs";
import path from "path";

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function generatePngsFromSvg() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch (e) {
    console.warn("[icons] Sharp not installed; skipping PNG generation.");
    return; // do not fail the build
  }

  const projectRoot = path.resolve(process.cwd());
  const svgPath = path.join(projectRoot, "public", "placeholder.svg");
  const outDir = path.join(projectRoot, "public", "icons");
  const sizes = [144, 192, 512];

  if (!fs.existsSync(svgPath)) {
    console.warn(`[icons] Source SVG not found at ${svgPath}; skipping.`);
    return; // do not fail the build
  }

  await ensureDir(outDir);

  const svgBuffer = await fs.promises.readFile(svgPath);
  for (const size of sizes) {
    const outPath = path.join(outDir, `icon-${size}x${size}.png`);
    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(outPath);
      console.log(`[icons] Generated ${outPath}`);
    } catch (e) {
      console.warn(`[icons] Failed to generate ${outPath}:`, e?.message || e);
    }
  }
}

generatePngsFromSvg().catch((err) => {
  console.warn("[icons] Unexpected error (non-fatal):", err?.message || err);
  // do not exit with failure to avoid breaking vercel builds
});


