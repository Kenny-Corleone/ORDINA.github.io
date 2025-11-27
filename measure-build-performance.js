/**
 * Build Performance Measurement Script
 * Measures build time and analyzes build output
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function countChunks(distPath) {
  const chunks = {
    js: 0,
    css: 0,
    total: 0
  };

  try {
    const jsPath = path.join(distPath, 'assets', 'js');
    if (fs.existsSync(jsPath)) {
      const jsFiles = fs.readdirSync(jsPath).filter(f => 
        f.endsWith('.js') && !f.endsWith('.gz') && !f.endsWith('.br')
      );
      chunks.js = jsFiles.length;
    }

    const cssPath = path.join(distPath, 'assets', 'css');
    if (fs.existsSync(cssPath)) {
      const cssFiles = fs.readdirSync(cssPath).filter(f => 
        f.endsWith('.css') && !f.endsWith('.gz') && !f.endsWith('.br')
      );
      chunks.css = cssFiles.length;
    }

    chunks.total = chunks.js + chunks.css;
  } catch (error) {
    console.error('Error counting chunks:', error.message);
  }

  return chunks;
}

function measureBuildPerformance() {
  console.log('='.repeat(70));
  console.log('ORDINA Build Performance Measurement');
  console.log('='.repeat(70));
  console.log();

  // Clean dist directory first
  console.log('Cleaning dist directory...');
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  console.log('✓ Cleaned\n');

  // Measure build time
  console.log('Running production build...');
  const startTime = Date.now();
  
  try {
    const output = execSync('npm run build', {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    const endTime = Date.now();
    const buildTime = (endTime - startTime) / 1000; // Convert to seconds
    
    console.log('✓ Build completed successfully\n');

    // Count chunks
    const chunks = countChunks(distPath);

    // Display results
    console.log('='.repeat(70));
    console.log('Build Performance Results:');
    console.log('='.repeat(70));
    console.log(`  Build Time:`.padEnd(42) + `${buildTime.toFixed(2)}s`.padStart(15));
    console.log(`  JavaScript Chunks:`.padEnd(42) + chunks.js.toString().padStart(15));
    console.log(`  CSS Chunks:`.padEnd(42) + chunks.css.toString().padStart(15));
    console.log(`  Total Chunks:`.padEnd(42) + chunks.total.toString().padStart(15));
    console.log('='.repeat(70));
    console.log();

    // Parse Vite output for additional metrics
    const lines = output.split('\n');
    let viteBuildInfo = [];
    let capturing = false;
    
    for (const line of lines) {
      if (line.includes('dist/index.html') || line.includes('dist\\index.html')) {
        capturing = true;
      }
      if (capturing && line.trim()) {
        viteBuildInfo.push(line);
      }
      if (line.includes('built in')) {
        capturing = false;
      }
    }

    if (viteBuildInfo.length > 0) {
      console.log('Vite Build Output:');
      console.log('-'.repeat(70));
      viteBuildInfo.forEach(line => console.log(line));
      console.log('-'.repeat(70));
      console.log();
    }

    return {
      buildTime,
      buildTimeFormatted: `${buildTime.toFixed(2)}s`,
      chunks,
      success: true,
      output: viteBuildInfo.join('\n')
    };

  } catch (error) {
    const endTime = Date.now();
    const buildTime = (endTime - startTime) / 1000;
    
    console.error('✗ Build failed\n');
    console.error('Error:', error.message);
    
    return {
      buildTime,
      buildTimeFormatted: `${buildTime.toFixed(2)}s`,
      chunks: { js: 0, css: 0, total: 0 },
      success: false,
      error: error.message
    };
  }
}

// Run measurement
const metrics = measureBuildPerformance();

// Export for use in other scripts
export default metrics;
