/**
 * GitHub Pages Compatibility Checker
 * Проверяет совместимость приложения с GitHub Pages
 */

/**
 * Check all aspects of GitHub Pages compatibility
 * @returns {Object} Результаты проверки
 */
export function checkGitHubPagesCompatibility() {
  console.log('🔍 Checking GitHub Pages compatibility...');
  
  const results = {
    paths: checkRelativePaths(),
    modules: checkES6Modules(),
    cors: checkCORSResources(),
    https: checkHTTPSResources(),
    mimeTypes: checkMimeTypes(),
    overall: true
  };

  // Determine overall compatibility
  results.overall = Object.values(results).every(check => 
    typeof check === 'boolean' ? check : check.passed
  );

  // Log summary
  console.log('📊 GitHub Pages Compatibility Report:');
  console.log('  ✓ Relative Paths:', results.paths.passed ? 'PASS' : 'FAIL');
  console.log('  ✓ ES6 Modules:', results.modules.passed ? 'PASS' : 'FAIL');
  console.log('  ✓ CORS Resources:', results.cors.passed ? 'PASS' : 'FAIL');
  console.log('  ✓ HTTPS Resources:', results.https.passed ? 'PASS' : 'FAIL');
  console.log('  ✓ MIME Types:', results.mimeTypes.passed ? 'PASS' : 'FAIL');
  console.log('  ✓ Overall:', results.overall ? '✅ COMPATIBLE' : '❌ ISSUES FOUND');

  return results;
}

/**
 * Check if all resource paths are relative
 * @returns {Object} Результаты проверки путей
 */
function checkRelativePaths() {
  const issues = [];
  
  // Check script tags
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.startsWith('/') && !src.startsWith('//')) {
      issues.push(`Absolute path in script: ${src}`);
    }
  });

  // Check link tags
  const links = document.querySelectorAll('link[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      issues.push(`Absolute path in link: ${href}`);
    }
  });

  // Check img tags
  const images = document.querySelectorAll('img[src]');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('/') && !src.startsWith('//')) {
      issues.push(`Absolute path in image: ${src}`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    message: issues.length === 0 
      ? 'All paths are relative or external' 
      : `Found ${issues.length} absolute path(s)`
  };
}

/**
 * Check ES6 module support
 * @returns {Object} Результаты проверки модулей
 */
function checkES6Modules() {
  const issues = [];
  
  // Check if browser supports ES6 modules
  const supportsModules = 'noModule' in document.createElement('script');
  if (!supportsModules) {
    issues.push('Browser may not support ES6 modules');
  }

  // Check if main script has type="module"
  const mainScript = document.querySelector('script[src*="main.js"]');
  if (mainScript && mainScript.getAttribute('type') !== 'module') {
    issues.push('Main script should have type="module"');
  }

  // Check for module scripts
  const moduleScripts = document.querySelectorAll('script[type="module"]');
  if (moduleScripts.length === 0) {
    issues.push('No module scripts found');
  }

  return {
    passed: issues.length === 0,
    issues,
    message: issues.length === 0 
      ? 'ES6 modules properly configured' 
      : `Found ${issues.length} module issue(s)`
  };
}

/**
 * Check CORS for external resources
 * @returns {Object} Результаты проверки CORS
 */
function checkCORSResources() {
  const issues = [];
  const externalResources = [];

  // Check scripts
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      externalResources.push(src);
      
      // Check for crossorigin attribute
      if (!script.hasAttribute('crossorigin') && !src.includes('gstatic.com')) {
        // Some CDNs don't require crossorigin attribute
        const knownSafeCDNs = ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com'];
        const isSafeCDN = knownSafeCDNs.some(cdn => src.includes(cdn));
        if (!isSafeCDN) {
          issues.push(`External script without crossorigin: ${src}`);
        }
      }
    }
  });

  // Check links (stylesheets, fonts)
  const links = document.querySelectorAll('link[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      externalResources.push(href);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    externalResources,
    message: issues.length === 0 
      ? `${externalResources.length} external resources properly configured` 
      : `Found ${issues.length} CORS issue(s)`
  };
}

/**
 * Check if all resources use HTTPS
 * @returns {Object} Результаты проверки HTTPS
 */
function checkHTTPSResources() {
  const issues = [];

  // Check scripts
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.startsWith('http://')) {
      issues.push(`Insecure HTTP script: ${src}`);
    }
  });

  // Check links
  const links = document.querySelectorAll('link[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('http://')) {
      issues.push(`Insecure HTTP link: ${href}`);
    }
  });

  // Check images
  const images = document.querySelectorAll('img[src]');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('http://')) {
      issues.push(`Insecure HTTP image: ${src}`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    message: issues.length === 0 
      ? 'All external resources use HTTPS' 
      : `Found ${issues.length} insecure resource(s)`
  };
}

/**
 * Check MIME types for modules
 * @returns {Object} Результаты проверки MIME типов
 */
function checkMimeTypes() {
  const issues = [];
  const warnings = [];

  // Check if .js files will be served with correct MIME type
  // This is a warning since we can't check server configuration from client
  warnings.push('Ensure .js files are served with "text/javascript" or "application/javascript" MIME type');
  warnings.push('GitHub Pages automatically serves .js files with correct MIME type');

  // Check for .mjs files (not recommended for GitHub Pages)
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.endsWith('.mjs')) {
      issues.push(`Using .mjs extension: ${src}. Use .js instead for better compatibility`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    warnings,
    message: issues.length === 0 
      ? 'MIME types should be compatible' 
      : `Found ${issues.length} MIME type issue(s)`
  };
}

/**
 * Test module loading
 * @returns {Promise<Object>} Результаты теста загрузки модулей
 */
export async function testModuleLoading() {
  console.log('🧪 Testing module loading...');
  
  const results = {
    passed: true,
    modules: [],
    errors: []
  };

  // Test loading a sample module
  try {
    const testModule = await import('./helpers.js');
    results.modules.push({ name: 'helpers.js', status: 'success' });
  } catch (error) {
    results.passed = false;
    results.errors.push({ module: 'helpers.js', error: error.message });
  }

  console.log('Module loading test:', results.passed ? '✅ PASS' : '❌ FAIL');
  return results;
}

/**
 * Generate compatibility report
 * @returns {string} HTML отчет
 */
export function generateCompatibilityReport() {
  const results = checkGitHubPagesCompatibility();
  
  let html = '<div style="font-family: monospace; padding: 20px; background: #f5f5f5;">';
  html += '<h2 style="color: #333;">GitHub Pages Compatibility Report</h2>';
  
  // Overall status
  html += `<div style="padding: 10px; margin: 10px 0; background: ${results.overall ? '#d4edda' : '#f8d7da'}; border-radius: 5px;">`;
  html += `<strong>Overall Status:</strong> ${results.overall ? '✅ Compatible' : '❌ Issues Found'}`;
  html += '</div>';
  
  // Detailed results
  const checks = [
    { name: 'Relative Paths', result: results.paths },
    { name: 'ES6 Modules', result: results.modules },
    { name: 'CORS Resources', result: results.cors },
    { name: 'HTTPS Resources', result: results.https },
    { name: 'MIME Types', result: results.mimeTypes }
  ];
  
  checks.forEach(check => {
    html += `<div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid ${check.result.passed ? '#28a745' : '#dc3545'};">`;
    html += `<strong>${check.result.passed ? '✅' : '❌'} ${check.name}:</strong> ${check.result.message}<br>`;
    
    if (check.result.issues && check.result.issues.length > 0) {
      html += '<ul style="margin: 5px 0; padding-left: 20px;">';
      check.result.issues.forEach(issue => {
        html += `<li style="color: #dc3545;">${issue}</li>`;
      });
      html += '</ul>';
    }
    
    if (check.result.warnings && check.result.warnings.length > 0) {
      html += '<ul style="margin: 5px 0; padding-left: 20px;">';
      check.result.warnings.forEach(warning => {
        html += `<li style="color: #ffc107;">${warning}</li>`;
      });
      html += '</ul>';
    }
    
    html += '</div>';
  });
  
  html += '</div>';
  
  return html;
}

/**
 * Run all compatibility checks and log results
 */
export function runCompatibilityChecks() {
  const results = checkGitHubPagesCompatibility();
  
  if (!results.overall) {
    console.warn('⚠️ GitHub Pages compatibility issues detected!');
    console.warn('Run generateCompatibilityReport() for detailed information');
  } else {
    console.log('✅ Application is compatible with GitHub Pages');
  }
  
  return results;
}

// Auto-run checks in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🔧 Development mode detected - running compatibility checks...');
  setTimeout(() => {
    runCompatibilityChecks();
  }, 2000);
}
