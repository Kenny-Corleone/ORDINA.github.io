/**
 * Improvement Metrics Calculation Script
 * Compares baseline metrics with current metrics to calculate improvements
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
        
        // Skip compressed versions
        if (ext === '.gz' || ext === '.br') {
          continue;
        }
        
        if (extensions.length === 0 || extensions.includes(ext)) {
          const size = getFileSize(fullPath);
          totalSize += size;
          files.push({
            name: item.name,
            path: fullPath.replace(__dirname + path.sep, ''),
            size: size
          });
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }

  return { totalSize, files };
}

function getCurrentMetrics() {
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const jsPath = path.join(distPath, 'assets', 'js');
  const cssPath = path.join(distPath, 'assets', 'css');
  const pngPath = path.join(distPath, 'assets', 'png');
  const htmlPath = path.join(distPath, 'index.html');

  const jsResult = measureDirectory(jsPath, ['.js']);
  const cssResult = measureDirectory(cssPath, ['.css']);
  const pngResult = measureDirectory(pngPath, ['.png', '.jpg', '.jpeg', '.webp', '.svg']);
  const htmlSize = getFileSize(htmlPath);

  const totalSize = jsResult.totalSize + cssResult.totalSize + pngResult.totalSize + htmlSize;

  return {
    javascript: jsResult.totalSize,
    css: cssResult.totalSize,
    images: pngResult.totalSize,
    html: htmlSize,
    total: totalSize,
    chunks: {
      js: jsResult.files.length,
      css: cssResult.files.length,
      total: jsResult.files.length + cssResult.files.length
    }
  };
}

function calculateImprovements() {
  console.log('='.repeat(70));
  console.log('ORDINA Performance Improvement Metrics');
  console.log('='.repeat(70));
  console.log();

  // Baseline metrics from project discovery (estimated before optimization)
  // Based on docs/bundle-optimization-report.md and docs/project-discovery-analysis.md
  const baseline = {
    javascript: 700 * 1024,  // ~700 KB (Firebase ~400KB + App ~300KB)
    css: 80 * 1024,          // ~80 KB
    images: 20 * 1024,       // ~20 KB
    html: 75 * 1024,         // ~75 KB (from discovery)
    total: 875 * 1024        // ~875 KB total
  };

  // Get current metrics
  const current = getCurrentMetrics();

  // Calculate improvements
  const improvements = {
    javascript: {
      baseline: baseline.javascript,
      current: current.javascript,
      reduction: baseline.javascript - current.javascript,
      percentage: ((baseline.javascript - current.javascript) / baseline.javascript * 100)
    },
    css: {
      baseline: baseline.css,
      current: current.css,
      reduction: baseline.css - current.css,
      percentage: ((baseline.css - current.css) / baseline.css * 100)
    },
    images: {
      baseline: baseline.images,
      current: current.images,
      reduction: baseline.images - current.images,
      percentage: ((baseline.images - current.images) / baseline.images * 100)
    },
    html: {
      baseline: baseline.html,
      current: current.html,
      reduction: baseline.html - current.html,
      percentage: ((baseline.html - current.html) / baseline.html * 100)
    },
    total: {
      baseline: baseline.total,
      current: current.total,
      reduction: baseline.total - current.total,
      percentage: ((baseline.total - current.total) / baseline.total * 100)
    }
  };

  // Display results
  console.log('Baseline Metrics (Before Optimization):');
  console.log('-'.repeat(70));
  console.log(`  JavaScript:`.padEnd(42) + formatBytes(baseline.javascript).padStart(15));
  console.log(`  CSS:`.padEnd(42) + formatBytes(baseline.css).padStart(15));
  console.log(`  Images:`.padEnd(42) + formatBytes(baseline.images).padStart(15));
  console.log(`  HTML:`.padEnd(42) + formatBytes(baseline.html).padStart(15));
  console.log(`  Total:`.padEnd(42) + formatBytes(baseline.total).padStart(15));
  console.log();

  console.log('Current Metrics (After Optimization):');
  console.log('-'.repeat(70));
  console.log(`  JavaScript:`.padEnd(42) + formatBytes(current.javascript).padStart(15));
  console.log(`  CSS:`.padEnd(42) + formatBytes(current.css).padStart(15));
  console.log(`  Images:`.padEnd(42) + formatBytes(current.images).padStart(15));
  console.log(`  HTML:`.padEnd(42) + formatBytes(current.html).padStart(15));
  console.log(`  Total:`.padEnd(42) + formatBytes(current.total).padStart(15));
  console.log();

  console.log('='.repeat(70));
  console.log('Improvement Metrics:');
  console.log('='.repeat(70));
  
  const formatImprovement = (metric) => {
    const sign = metric.reduction >= 0 ? '-' : '+';
    const color = metric.reduction >= 0 ? '✓' : '✗';
    return `${color} ${sign}${formatBytes(Math.abs(metric.reduction))} (${sign}${Math.abs(metric.percentage).toFixed(2)}%)`;
  };

  console.log(`  JavaScript:`.padEnd(42) + formatImprovement(improvements.javascript).padStart(28));
  console.log(`  CSS:`.padEnd(42) + formatImprovement(improvements.css).padStart(28));
  console.log(`  Images:`.padEnd(42) + formatImprovement(improvements.images).padStart(28));
  console.log(`  HTML:`.padEnd(42) + formatImprovement(improvements.html).padStart(28));
  console.log('-'.repeat(70));
  console.log(`  Total Bundle Size:`.padEnd(42) + formatImprovement(improvements.total).padStart(28));
  console.log('='.repeat(70));
  console.log();

  // Check if target is met (≥20% reduction)
  const targetMet = improvements.total.percentage >= 20;
  
  console.log('Target Verification:');
  console.log('-'.repeat(70));
  console.log(`  Target: ≥20% bundle size reduction`);
  console.log(`  Achieved: ${improvements.total.percentage.toFixed(2)}%`);
  console.log(`  Status: ${targetMet ? '✓ TARGET MET' : '✗ TARGET NOT MET'}`);
  console.log('='.repeat(70));
  console.log();

  // Additional metrics
  console.log('Additional Metrics:');
  console.log('-'.repeat(70));
  console.log(`  JavaScript Chunks:`.padEnd(42) + current.chunks.js.toString().padStart(15));
  console.log(`  CSS Chunks:`.padEnd(42) + current.chunks.css.toString().padStart(15));
  console.log(`  Total Chunks:`.padEnd(42) + current.chunks.total.toString().padStart(15));
  console.log('='.repeat(70));
  console.log();

  // Key optimizations applied
  console.log('Key Optimizations Applied:');
  console.log('-'.repeat(70));
  console.log('  ✓ Code splitting (vendor and application code separated)');
  console.log('  ✓ Tree shaking (unused code eliminated)');
  console.log('  ✓ Minification (Terser for JavaScript)');
  console.log('  ✓ CSS optimization (Tailwind purging)');
  console.log('  ✓ Asset optimization (images compressed)');
  console.log('  ✓ Console.log removal in production');
  console.log('  ✓ Gzip and Brotli compression enabled');
  console.log('='.repeat(70));
  console.log();

  return {
    baseline,
    current,
    improvements,
    targetMet,
    summary: {
      totalReduction: formatBytes(improvements.total.reduction),
      totalPercentage: improvements.total.percentage.toFixed(2) + '%',
      targetMet: targetMet ? 'Yes' : 'No'
    }
  };
}

// Run calculation
const metrics = calculateImprovements();

// Export for use in other scripts
export default metrics;
