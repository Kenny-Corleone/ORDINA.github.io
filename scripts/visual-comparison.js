/**
 * Visual Comparison Script
 * 
 * This script helps compare screenshots between the original ORDINA application
 * and the migrated ORDINA-SVELTE application.
 * 
 * Usage:
 *   node scripts/visual-comparison.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const ORIGINAL_SCREENSHOTS_DIR = path.join(__dirname, '../../ORDINA MAIN/screenshots');
const MIGRATED_SCREENSHOTS_DIR = path.join(__dirname, '../test-results/screenshots');
const COMPARISON_RESULTS_DIR = path.join(__dirname, '../test-results/visual-comparison');

// Create comparison results directory
if (!fs.existsSync(COMPARISON_RESULTS_DIR)) {
  fs.mkdirSync(COMPARISON_RESULTS_DIR, { recursive: true });
}

/**
 * Get list of screenshots from a directory
 */
function getScreenshots(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return [];
  }
  
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.png'))
    .map(file => ({
      name: file,
      path: path.join(dir, file)
    }));
}

/**
 * Compare screenshots
 */
function compareScreenshots() {
  console.log('🔍 Visual Comparison Script\n');
  console.log('=' .repeat(60));
  
  // Get screenshots from both directories
  const originalScreenshots = getScreenshots(ORIGINAL_SCREENSHOTS_DIR);
  const migratedScreenshots = getScreenshots(MIGRATED_SCREENSHOTS_DIR);
  
  console.log(`\n📁 Original screenshots: ${originalScreenshots.length}`);
  console.log(`📁 Migrated screenshots: ${migratedScreenshots.length}\n`);
  
  if (originalScreenshots.length === 0) {
    console.log('⚠️  No original screenshots found.');
    console.log('   Please capture screenshots from ORDINA MAIN first.\n');
    return;
  }
  
  if (migratedScreenshots.length === 0) {
    console.log('⚠️  No migrated screenshots found.');
    console.log('   Please run: npx playwright test tests/visual/capture-screenshots.spec.ts\n');
    return;
  }
  
  // Create comparison report
  const report = {
    timestamp: new Date().toISOString(),
    originalCount: originalScreenshots.length,
    migratedCount: migratedScreenshots.length,
    comparisons: []
  };
  
  // Find matching screenshots
  const originalNames = new Set(originalScreenshots.map(s => s.name));
  const migratedNames = new Set(migratedScreenshots.map(s => s.name));
  
  const matchingNames = [...originalNames].filter(name => migratedNames.has(name));
  const missingInMigrated = [...originalNames].filter(name => !migratedNames.has(name));
  const extraInMigrated = [...migratedNames].filter(name => !originalNames.has(name));
  
  console.log('📊 Comparison Summary:\n');
  console.log(`   ✅ Matching screenshots: ${matchingNames.length}`);
  console.log(`   ⚠️  Missing in migrated: ${missingInMigrated.length}`);
  console.log(`   ℹ️  Extra in migrated: ${extraInMigrated.length}\n`);
  
  // List matching screenshots
  if (matchingNames.length > 0) {
    console.log('✅ Matching Screenshots:\n');
    matchingNames.forEach(name => {
      console.log(`   - ${name}`);
      report.comparisons.push({
        name,
        status: 'matched',
        originalPath: path.join(ORIGINAL_SCREENSHOTS_DIR, name),
        migratedPath: path.join(MIGRATED_SCREENSHOTS_DIR, name)
      });
    });
    console.log('');
  }
  
  // List missing screenshots
  if (missingInMigrated.length > 0) {
    console.log('⚠️  Missing in Migrated:\n');
    missingInMigrated.forEach(name => {
      console.log(`   - ${name}`);
      report.comparisons.push({
        name,
        status: 'missing_in_migrated',
        originalPath: path.join(ORIGINAL_SCREENSHOTS_DIR, name)
      });
    });
    console.log('');
  }
  
  // List extra screenshots
  if (extraInMigrated.length > 0) {
    console.log('ℹ️  Extra in Migrated:\n');
    extraInMigrated.forEach(name => {
      console.log(`   - ${name}`);
      report.comparisons.push({
        name,
        status: 'extra_in_migrated',
        migratedPath: path.join(MIGRATED_SCREENSHOTS_DIR, name)
      });
    });
    console.log('');
  }
  
  // Save report
  const reportPath = path.join(COMPARISON_RESULTS_DIR, 'comparison-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}\n`);
  
  // Generate markdown report
  generateMarkdownReport(report);
  
  console.log('=' .repeat(60));
  console.log('\n✨ Comparison complete!\n');
  console.log('Next steps:');
  console.log('1. Review matching screenshots manually');
  console.log('2. Use image comparison tool (e.g., ImageMagick, Pixelmatch)');
  console.log('3. Document any visual differences');
  console.log('4. Get approval for differences\n');
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report) {
  const markdown = `# Visual Comparison Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Original Screenshots:** ${report.originalCount}
- **Migrated Screenshots:** ${report.migratedCount}
- **Matching:** ${report.comparisons.filter(c => c.status === 'matched').length}
- **Missing in Migrated:** ${report.comparisons.filter(c => c.status === 'missing_in_migrated').length}
- **Extra in Migrated:** ${report.comparisons.filter(c => c.status === 'extra_in_migrated').length}

## Matching Screenshots

${report.comparisons
  .filter(c => c.status === 'matched')
  .map(c => `- ✅ ${c.name}`)
  .join('\n')}

## Missing in Migrated

${report.comparisons
  .filter(c => c.status === 'missing_in_migrated')
  .map(c => `- ⚠️ ${c.name}`)
  .join('\n') || '_None_'}

## Extra in Migrated

${report.comparisons
  .filter(c => c.status === 'extra_in_migrated')
  .map(c => `- ℹ️ ${c.name}`)
  .join('\n') || '_None_'}

## Next Steps

1. **Manual Review**: Compare matching screenshots visually
2. **Image Comparison**: Use tools like ImageMagick or Pixelmatch
3. **Document Differences**: Record any visual differences found
4. **Get Approval**: Obtain approval for any differences
5. **Update Baselines**: Update Playwright baselines if approved

## Comparison Commands

### Using ImageMagick

\`\`\`bash
# Compare two images
compare original.png migrated.png diff.png

# Get difference percentage
compare -metric RMSE original.png migrated.png null: 2>&1
\`\`\`

### Using Pixelmatch (Node.js)

\`\`\`javascript
const pixelmatch = require('pixelmatch');
const PNG = require('pngjs').PNG;
const fs = require('fs');

const img1 = PNG.sync.read(fs.readFileSync('original.png'));
const img2 = PNG.sync.read(fs.readFileSync('migrated.png'));
const diff = new PNG({ width: img1.width, height: img1.height });

const numDiffPixels = pixelmatch(
  img1.data, img2.data, diff.data,
  img1.width, img1.height,
  { threshold: 0.1 }
);

console.log(\`Difference: \${numDiffPixels} pixels\`);
\`\`\`
`;
  
  const markdownPath = path.join(COMPARISON_RESULTS_DIR, 'comparison-report.md');
  fs.writeFileSync(markdownPath, markdown);
  console.log(`📄 Markdown report saved to: ${markdownPath}\n`);
}

// Run comparison
compareScreenshots();
