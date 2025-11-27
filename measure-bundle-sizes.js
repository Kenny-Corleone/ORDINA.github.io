/**
 * Bundle Size Measurement Script
 * Measures JavaScript, CSS, and asset sizes in the dist directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function measureDirectory(dirPath, extensions = []) {
  let totalSize = 0;
  const files = [];

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        const subResult = measureDirectory(fullPath, extensions);
        totalSize += subResult.totalSize;
        files.push(...subResult.files);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();
        
        // Skip compressed versions (.gz, .br)
        if (ext === '.gz' || ext === '.br') {
          continue;
        }
        
        // If extensions filter is provided, check it
        if (extensions.length === 0 || extensions.includes(ext)) {
          const size = getFileSize(fullPath);
          totalSize += size;
          files.push({
            name: item.name,
            path: fullPath.replace(__dirname + path.sep, ''),
            size: size,
            sizeFormatted: formatBytes(size)
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return { totalSize, files };
}

function measureBundleSizes() {
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  console.log('='.repeat(70));
  console.log('ORDINA Bundle Size Measurement');
  console.log('='.repeat(70));
  console.log();

  // Measure JavaScript bundles
  const jsPath = path.join(distPath, 'assets', 'js');
  const jsResult = measureDirectory(jsPath, ['.js']);
  
  console.log('JavaScript Bundles:');
  console.log('-'.repeat(70));
  jsResult.files.forEach(file => {
    console.log(`  ${file.name.padEnd(40)} ${file.sizeFormatted.padStart(15)}`);
  });
  console.log('-'.repeat(70));
  console.log(`  Total JavaScript:`.padEnd(42) + formatBytes(jsResult.totalSize).padStart(15));
  console.log();

  // Measure CSS bundles
  const cssPath = path.join(distPath, 'assets', 'css');
  const cssResult = measureDirectory(cssPath, ['.css']);
  
  console.log('CSS Bundles:');
  console.log('-'.repeat(70));
  cssResult.files.forEach(file => {
    console.log(`  ${file.name.padEnd(40)} ${file.sizeFormatted.padStart(15)}`);
  });
  console.log('-'.repeat(70));
  console.log(`  Total CSS:`.padEnd(42) + formatBytes(cssResult.totalSize).padStart(15));
  console.log();

  // Measure images/assets
  const pngPath = path.join(distPath, 'assets', 'png');
  const pngResult = measureDirectory(pngPath, ['.png', '.jpg', '.jpeg', '.webp', '.svg']);
  
  console.log('Image Assets:');
  console.log('-'.repeat(70));
  pngResult.files.forEach(file => {
    console.log(`  ${file.name.padEnd(40)} ${file.sizeFormatted.padStart(15)}`);
  });
  console.log('-'.repeat(70));
  console.log(`  Total Images:`.padEnd(42) + formatBytes(pngResult.totalSize).padStart(15));
  console.log();

  // Measure HTML
  const htmlPath = path.join(distPath, 'index.html');
  const htmlSize = getFileSize(htmlPath);
  
  console.log('HTML:');
  console.log('-'.repeat(70));
  console.log(`  index.html`.padEnd(42) + formatBytes(htmlSize).padStart(15));
  console.log();

  // Calculate totals
  const totalAssets = jsResult.totalSize + cssResult.totalSize + pngResult.totalSize + htmlSize;
  
  console.log('='.repeat(70));
  console.log('Summary:');
  console.log('='.repeat(70));
  console.log(`  JavaScript:`.padEnd(42) + formatBytes(jsResult.totalSize).padStart(15));
  console.log(`  CSS:`.padEnd(42) + formatBytes(cssResult.totalSize).padStart(15));
  console.log(`  Images:`.padEnd(42) + formatBytes(pngResult.totalSize).padStart(15));
  console.log(`  HTML:`.padEnd(42) + formatBytes(htmlSize).padStart(15));
  console.log('-'.repeat(70));
  console.log(`  Total Bundle Size:`.padEnd(42) + formatBytes(totalAssets).padStart(15));
  console.log('='.repeat(70));
  console.log();

  // Return data for further processing
  return {
    javascript: {
      files: jsResult.files,
      total: jsResult.totalSize,
      totalFormatted: formatBytes(jsResult.totalSize)
    },
    css: {
      files: cssResult.files,
      total: cssResult.totalSize,
      totalFormatted: formatBytes(cssResult.totalSize)
    },
    images: {
      files: pngResult.files,
      total: pngResult.totalSize,
      totalFormatted: formatBytes(pngResult.totalSize)
    },
    html: {
      size: htmlSize,
      sizeFormatted: formatBytes(htmlSize)
    },
    total: {
      size: totalAssets,
      sizeFormatted: formatBytes(totalAssets)
    }
  };
}

// Run measurement
const metrics = measureBundleSizes();

// Export for use in other scripts
export default metrics;
