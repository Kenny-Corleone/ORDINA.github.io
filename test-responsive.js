/**
 * Responsive Testing Script for ORDINA Application
 * Tests mobile (375px), tablet (768px), and desktop (1280px) viewports
 * 
 * Requirements: 8.3, 8.4
 */

const fs = require('fs');

// Test configuration
const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'Mobile (375px)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (768px)' },
  desktop: { width: 1280, height: 800, name: 'Desktop (1280px)' }
};

const TOUCH_TARGET_MIN_SIZE = 44; // Minimum touch target size in pixels
const issues = [];

/**
 * Load and parse HTML file
 */
function loadHTML() {
  try {
    const html = fs.readFileSync('./index.html', 'utf-8');
    return html;
  } catch (error) {
    console.error('❌ Failed to load index.html:', error.message);
    process.exit(1);
  }
}

/**
 * Load and parse CSS file
 */
function loadCSS() {
  try {
    const css = fs.readFileSync('./src/styles/main.css', 'utf-8');
    return css;
  } catch (error) {
    console.warn('⚠️  Could not load main.css:', error.message);
    return '';
  }
}

/**
 * Simple HTML parser to extract elements
 */
function parseHTML(html) {
  return {
    querySelectorAll: (selector) => {
      const matches = [];
      // Simple regex-based matching for common selectors
      if (selector === 'button' || selector === 'a' || selector === 'input') {
        const regex = new RegExp(`<${selector}[^>]*>`, 'g');
        const found = html.match(regex) || [];
        return found.map(tag => ({
          tag,
          id: (tag.match(/id="([^"]+)"/) || [])[1] || '',
          className: (tag.match(/class="([^"]+)"/) || [])[1] || '',
          getAttribute: (attr) => {
            const match = tag.match(new RegExp(`${attr}="([^"]+)"`));
            return match ? match[1] : null;
          },
          hasAttribute: (attr) => tag.includes(`${attr}=`)
        }));
      }
      
      if (selector === 'img') {
        const regex = /<img[^>]*>/g;
        const found = html.match(regex) || [];
        return found.map(tag => ({
          tag,
          src: (tag.match(/src="([^"]+)"/) || [])[1] || '',
          id: (tag.match(/id="([^"]+)"/) || [])[1] || '',
          className: (tag.match(/class="([^"]+)"/) || [])[1] || '',
          hasAttribute: (attr) => tag.includes(`${attr}=`),
          getAttribute: (attr) => {
            const match = tag.match(new RegExp(`${attr}="([^"]+)"`));
            return match ? match[1] : null;
          }
        }));
      }
      
      if (selector === 'nav') {
        const navMatch = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/);
        return navMatch ? [{ 
          className: (navMatch[0].match(/class="([^"]+)"/) || [])[1] || '',
          querySelectorAll: (innerSelector) => {
            const innerMatches = navMatch[0].match(new RegExp(`<${innerSelector}[^>]*>`, 'g')) || [];
            return innerMatches;
          }
        }] : [];
      }
      
      // Generic class/attribute selectors
      if (selector.startsWith('[class*=')) {
        const classPattern = selector.match(/\[class\*="([^"]+)"\]/)[1];
        const regex = new RegExp(`class="[^"]*${classPattern}[^"]*"`, 'g');
        const matches = html.match(regex) || [];
        return matches.map(m => ({ className: m }));
      }
      
      return [];
    },
    querySelector: (selector) => {
      const all = parseHTML(html).querySelectorAll(selector);
      return all.length > 0 ? all[0] : null;
    }
  };
}

/**
 * Check if element has responsive units
 */
function hasResponsiveUnits(cssText) {
  const responsiveUnits = /(\d+\.?\d*)(rem|em|%|vw|vh|vmin|vmax)/g;
  const fixedUnits = /(\d+)px/g;
  
  const responsiveMatches = cssText.match(responsiveUnits) || [];
  const fixedMatches = cssText.match(fixedUnits) || [];
  
  return {
    hasResponsive: responsiveMatches.length > 0,
    hasFixed: fixedMatches.length > 0,
    responsiveCount: responsiveMatches.length,
    fixedCount: fixedMatches.length
  };
}

/**
 * Check for mobile-first media queries
 */
function checkMobileFirstApproach(css) {
  const minWidthQueries = (css.match(/@media[^{]*min-width/g) || []).length;
  const maxWidthQueries = (css.match(/@media[^{]*max-width/g) || []).length;
  
  return {
    minWidthQueries,
    maxWidthQueries,
    isMobileFirst: minWidthQueries >= maxWidthQueries
  };
}

/**
 * Extract media query breakpoints
 */
function extractBreakpoints(css) {
  const breakpointRegex = /@media[^{]*\((?:min|max)-width:\s*(\d+)px\)/g;
  const breakpoints = new Set();
  let match;
  
  while ((match = breakpointRegex.exec(css)) !== null) {
    breakpoints.add(parseInt(match[1]));
  }
  
  return Array.from(breakpoints).sort((a, b) => a - b);
}

/**
 * Check interactive elements for adequate touch targets
 */
function checkTouchTargets(html) {
  const touchIssues = [];
  
  // Check buttons
  const buttons = (html.match(/<button[^>]*>/g) || []);
  buttons.forEach((button, index) => {
    const id = (button.match(/id="([^"]+)"/) || [])[1] || `button-${index}`;
    const classList = (button.match(/class="([^"]+)"/) || [])[1] || '';
    const hasMinSize = /w-\d+|h-\d+|p-\d+|min-w-|min-h-/.test(classList);
    
    if (!hasMinSize && !classList.includes('btn')) {
      touchIssues.push({
        element: id,
        selector: 'button',
        issue: 'No explicit size classes found - may be too small for touch'
      });
    }
  });
  
  return touchIssues;
}

/**
 * Check for horizontal scroll issues
 */
function checkHorizontalScroll(html) {
  const scrollIssues = [];
  
  // Check for fixed width elements that might cause scroll
  const styleMatches = html.match(/style="[^"]*width:\s*\d+px[^"]*"/g) || [];
  styleMatches.forEach(styleAttr => {
    const widthMatch = styleAttr.match(/width:\s*(\d+)px/);
    if (widthMatch) {
      const width = parseInt(widthMatch[1]);
      if (width > 375) {
        scrollIssues.push({
          element: 'inline-styled-element',
          width: width,
          issue: 'Fixed width exceeds mobile viewport'
        });
      }
    }
  });
  
  return scrollIssues;
}

/**
 * Check layout structure for responsive design
 */
function checkLayoutStructure(html) {
  const layoutIssues = [];
  
  // Check for flex/grid containers
  const flexContainers = (html.match(/class="[^"]*flex[^"]*"/g) || []).length;
  const gridContainers = (html.match(/class="[^"]*grid[^"]*"/g) || []).length;
  
  if (flexContainers === 0 && gridContainers === 0) {
    layoutIssues.push({
      issue: 'No flex or grid containers found - layout may not be responsive'
    });
  }
  
  // Check for responsive image attributes
  const images = html.match(/<img[^>]*>/g) || [];
  images.forEach(img => {
    const hasSrcset = img.includes('srcset=');
    const hasSizes = img.includes('sizes=');
    const hasWidth = img.includes('width=');
    const hasHeight = img.includes('height=');
    const src = (img.match(/src="([^"]+)"/) || [])[1] || 'unnamed';
    
    if (!hasSrcset && !img.includes('w-')) {
      layoutIssues.push({
        element: src,
        issue: 'Image missing srcset attribute for responsive loading'
      });
    }
    
    if (!hasWidth || !hasHeight) {
      layoutIssues.push({
        element: src,
        issue: 'Image missing width/height attributes (may cause layout shift)'
      });
    }
  });
  
  return layoutIssues;
}

/**
 * Check navigation responsiveness
 */
function checkNavigation(html) {
  const navIssues = [];
  
  const navMatch = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/);
  if (!navMatch) {
    navIssues.push({ issue: 'No navigation element found' });
    return navIssues;
  }
  
  const navContent = navMatch[0];
  const navButtons = (navContent.match(/<button[^>]*>/g) || []).length;
  const navLinks = (navContent.match(/<a[^>]*>/g) || []).length;
  const totalItems = navButtons + navLinks;
  
  if (totalItems > 6) {
    const hasOverflow = navContent.includes('overflow');
    if (!hasOverflow) {
      navIssues.push({
        issue: `Navigation has ${totalItems} items but no overflow handling for mobile`
      });
    }
  }
  
  return navIssues;
}

/**
 * Test mobile viewport (375px)
 */
function testMobileViewport(html, css) {
  console.log('\n📱 Testing Mobile Viewport (375px × 667px)');
  console.log('='.repeat(60));
  
  const viewport = VIEWPORTS.mobile;
  const mobileIssues = [];
  
  // Check touch targets
  console.log('\n🎯 Checking touch targets...');
  const touchIssues = checkTouchTargets(html);
  if (touchIssues.length > 0) {
    console.log(`⚠️  Found ${touchIssues.length} potential touch target issues`);
    touchIssues.slice(0, 5).forEach(issue => {
      console.log(`   - ${issue.element}: ${issue.issue}`);
    });
    if (touchIssues.length > 5) {
      console.log(`   ... and ${touchIssues.length - 5} more`);
    }
    mobileIssues.push(...touchIssues);
  } else {
    console.log('✅ Touch targets appear adequate');
  }
  
  // Check for horizontal scroll
  console.log('\n📏 Checking for horizontal scroll issues...');
  const scrollIssues = checkHorizontalScroll(html);
  if (scrollIssues.length > 0) {
    console.log(`❌ Found ${scrollIssues.length} potential scroll issues`);
    scrollIssues.forEach(issue => {
      console.log(`   - ${issue.element}: ${issue.width}px (${issue.issue})`);
    });
    mobileIssues.push(...scrollIssues);
  } else {
    console.log('✅ No obvious horizontal scroll issues');
  }
  
  // Check layout structure
  console.log('\n🏗️  Checking layout structure...');
  const layoutIssues = checkLayoutStructure(html);
  if (layoutIssues.length > 0) {
    console.log(`⚠️  Found ${layoutIssues.length} layout considerations`);
    layoutIssues.slice(0, 3).forEach(issue => {
      console.log(`   - ${issue.element || 'Layout'}: ${issue.issue}`);
    });
    mobileIssues.push(...layoutIssues);
  } else {
    console.log('✅ Layout structure looks good');
  }
  
  // Check navigation
  console.log('\n🧭 Checking navigation...');
  const navIssues = checkNavigation(html);
  if (navIssues.length > 0) {
    console.log(`⚠️  Found ${navIssues.length} navigation issues`);
    navIssues.forEach(issue => {
      console.log(`   - ${issue.issue}`);
    });
    mobileIssues.push(...navIssues);
  } else {
    console.log('✅ Navigation structure looks good');
  }
  
  return mobileIssues;
}

/**
 * Test tablet viewport (768px)
 */
function testTabletViewport(html, css) {
  console.log('\n📱 Testing Tablet Viewport (768px × 1024px)');
  console.log('='.repeat(60));
  
  const tabletIssues = [];
  
  // Check for grid layouts
  console.log('\n🎨 Checking grid layouts...');
  const gridContainers = (html.match(/class="[^"]*grid[^"]*"/g) || []);
  if (gridContainers.length > 0) {
    console.log(`✅ Found ${gridContainers.length} grid containers`);
    
    gridContainers.forEach((container, index) => {
      const hasResponsiveCols = /grid-cols-\d+|md:grid-cols|lg:grid-cols/.test(container);
      if (!hasResponsiveCols) {
        tabletIssues.push({
          element: `grid-container-${index}`,
          issue: 'Grid container may not have responsive column definitions'
        });
      }
    });
  } else {
    console.log('ℹ️  No explicit grid containers found');
  }
  
  // Check flex layouts
  console.log('\n📐 Checking flex layouts...');
  const flexContainers = (html.match(/class="[^"]*flex[^"]*"/g) || []);
  if (flexContainers.length > 0) {
    console.log(`✅ Found ${flexContainers.length} flex containers`);
  }
  
  // Check spacing and alignment
  console.log('\n📏 Checking spacing...');
  const hasSpacingClasses = html.match(/class="[^"]*(gap-|space-)[^"]*"/);
  if (hasSpacingClasses) {
    console.log('✅ Spacing utilities are being used');
  } else {
    console.log('⚠️  Limited spacing utilities found');
  }
  
  return tabletIssues;
}

/**
 * Test desktop viewport (1280px)
 */
function testDesktopViewport(html, css) {
  console.log('\n🖥️  Testing Desktop Viewport (1280px × 800px)');
  console.log('='.repeat(60));
  
  const desktopIssues = [];
  
  // Check for multi-column layouts
  console.log('\n📊 Checking multi-column layouts...');
  const hasLgClasses = html.match(/class="[^"]*lg:[^"]*"/);
  if (hasLgClasses) {
    console.log('✅ Desktop-specific responsive classes found');
  } else {
    console.log('⚠️  No desktop-specific responsive classes found');
    desktopIssues.push({
      issue: 'No lg: breakpoint classes found - desktop layout may not be optimized'
    });
  }
  
  // Check max-width constraints
  console.log('\n📐 Checking max-width constraints...');
  const hasMaxWidth = html.match(/class="[^"]*max-w-[^"]*"/);
  if (hasMaxWidth) {
    console.log('✅ Max-width constraints are being used');
  } else {
    console.log('⚠️  No max-width constraints found - content may stretch too wide');
  }
  
  // Check for all features visible
  console.log('\n🎯 Checking feature visibility...');
  const hiddenElements = (html.match(/class="[^"]*hidden[^"]*"/g) || []);
  const conditionallyHidden = hiddenElements.filter(el => {
    return /lg:block|lg:flex|lg:grid/.test(el);
  });
  
  if (conditionallyHidden.length > 0) {
    console.log(`✅ Found ${conditionallyHidden.length} elements with responsive visibility`);
  }
  
  return desktopIssues;
}

/**
 * Analyze CSS for responsive design patterns
 */
function analyzeCSS(css) {
  console.log('\n🎨 Analyzing CSS for Responsive Design');
  console.log('='.repeat(60));
  
  // Check mobile-first approach
  const mobileFirst = checkMobileFirstApproach(css);
  console.log('\n📱 Mobile-First Approach:');
  console.log(`   - min-width queries: ${mobileFirst.minWidthQueries}`);
  console.log(`   - max-width queries: ${mobileFirst.maxWidthQueries}`);
  console.log(`   - Is mobile-first: ${mobileFirst.isMobileFirst ? '✅ Yes' : '⚠️  No'}`);
  
  if (!mobileFirst.isMobileFirst) {
    issues.push({
      severity: 'medium',
      issue: 'CSS uses more max-width than min-width queries (not mobile-first)'
    });
  }
  
  // Extract breakpoints
  const breakpoints = extractBreakpoints(css);
  console.log('\n📏 Breakpoints found:');
  if (breakpoints.length > 0) {
    breakpoints.forEach(bp => {
      console.log(`   - ${bp}px`);
    });
  } else {
    console.log('   ⚠️  No explicit breakpoints found in CSS');
  }
  
  // Check for responsive units
  const unitsCheck = hasResponsiveUnits(css);
  console.log('\n📐 Unit Usage:');
  console.log(`   - Responsive units (rem, em, %, vw, vh): ${unitsCheck.responsiveCount}`);
  console.log(`   - Fixed units (px): ${unitsCheck.fixedCount}`);
  
  if (unitsCheck.fixedCount > unitsCheck.responsiveCount * 2) {
    console.log('   ⚠️  High ratio of fixed units - consider using more relative units');
    issues.push({
      severity: 'low',
      issue: 'CSS uses more fixed (px) units than responsive units'
    });
  } else {
    console.log('   ✅ Good balance of responsive units');
  }
}

/**
 * Generate summary report
 */
function generateSummary(mobileIssues, tabletIssues, desktopIssues) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESPONSIVE TESTING SUMMARY');
  console.log('='.repeat(60));
  
  const totalIssues = mobileIssues.length + tabletIssues.length + desktopIssues.length + issues.length;
  
  console.log(`\n📱 Mobile (375px): ${mobileIssues.length} issues`);
  console.log(`📱 Tablet (768px): ${tabletIssues.length} issues`);
  console.log(`🖥️  Desktop (1280px): ${desktopIssues.length} issues`);
  console.log(`🎨 CSS Analysis: ${issues.length} issues`);
  console.log(`\n📊 Total Issues: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n✅ All responsive tests passed!');
    return true;
  } else {
    console.log('\n⚠️  Some responsive issues found - see details above');
    return false;
  }
}

/**
 * Main test runner
 */
function runResponsiveTests() {
  console.log('🚀 Starting Responsive Design Tests');
  console.log('Testing ORDINA Application across multiple viewports\n');
  
  const html = loadHTML();
  const css = loadCSS();
  
  // Run viewport tests
  const mobileIssues = testMobileViewport(html, css);
  const tabletIssues = testTabletViewport(html, css);
  const desktopIssues = testDesktopViewport(html, css);
  
  // Analyze CSS
  analyzeCSS(css);
  
  // Generate summary
  const allPassed = generateSummary(mobileIssues, tabletIssues, desktopIssues);
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runResponsiveTests();
