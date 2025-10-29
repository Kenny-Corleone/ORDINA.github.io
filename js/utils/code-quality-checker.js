/**
 * Code Quality Checker
 * Утилита для проверки качества кода
 */

/**
 * Check JSDoc comments in code
 * @param {string} code - Source code to check
 * @param {string} filename - Name of the file
 * @returns {Object} Results of JSDoc check
 */
export function checkJSDocComments(code, filename) {
  const issues = [];
  const warnings = [];
  
  // Find all function declarations
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;
  const classMethodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g;
  const arrowFunctionRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
  
  let match;
  const functions = [];
  
  // Find regular functions
  while ((match = functionRegex.exec(code)) !== null) {
    functions.push({ name: match[1], line: getLineNumber(code, match.index) });
  }
  
  // Find arrow functions
  while ((match = arrowFunctionRegex.exec(code)) !== null) {
    functions.push({ name: match[1], line: getLineNumber(code, match.index) });
  }
  
  // Check if functions have JSDoc
  functions.forEach(func => {
    const funcIndex = code.indexOf(`function ${func.name}`) || code.indexOf(`const ${func.name}`);
    if (funcIndex > 0) {
      const beforeFunc = code.substring(Math.max(0, funcIndex - 200), funcIndex);
      if (!beforeFunc.includes('/**') || !beforeFunc.includes('*/')) {
        warnings.push(`Function '${func.name}' at line ${func.line} may be missing JSDoc comment`);
      }
    }
  });
  
  // Find all classes
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  const classes = [];
  
  while ((match = classRegex.exec(code)) !== null) {
    classes.push({ name: match[1], line: getLineNumber(code, match.index) });
  }
  
  // Check if classes have JSDoc
  classes.forEach(cls => {
    const classIndex = code.indexOf(`class ${cls.name}`);
    if (classIndex > 0) {
      const beforeClass = code.substring(Math.max(0, classIndex - 200), classIndex);
      if (!beforeClass.includes('/**') || !beforeClass.includes('*/')) {
        warnings.push(`Class '${cls.name}' at line ${cls.line} may be missing JSDoc comment`);
      }
    }
  });
  
  return {
    filename,
    functionsFound: functions.length,
    classesFound: classes.length,
    issues,
    warnings,
    passed: issues.length === 0
  };
}

/**
 * Check coding style consistency
 * @param {string} code - Source code to check
 * @param {string} filename - Name of the file
 * @returns {Object} Results of style check
 */
export function checkCodingStyle(code, filename) {
  const issues = [];
  const warnings = [];
  
  // Check for var usage (should use let/const)
  const varRegex = /\bvar\s+\w+/g;
  const varMatches = code.match(varRegex);
  if (varMatches) {
    warnings.push(`Found ${varMatches.length} usage(s) of 'var'. Consider using 'let' or 'const'`);
  }
  
  // Check for console.log in production code (warning only)
  const consoleLogRegex = /console\.log\(/g;
  const consoleMatches = code.match(consoleLogRegex);
  if (consoleMatches && consoleMatches.length > 10) {
    warnings.push(`Found ${consoleMatches.length} console.log statements. Consider using a logging service`);
  }
  
  // Check for TODO/FIXME comments
  const todoRegex = /\/\/\s*(TODO|FIXME|HACK|XXX):/gi;
  const todoMatches = code.match(todoRegex);
  if (todoMatches) {
    warnings.push(`Found ${todoMatches.length} TODO/FIXME comment(s)`);
  }
  
  // Check for long lines (>120 characters)
  const lines = code.split('\n');
  const longLines = lines.filter((line, index) => {
    // Ignore lines with URLs or imports
    if (line.includes('http://') || line.includes('https://') || line.includes('import')) {
      return false;
    }
    return line.length > 120;
  });
  
  if (longLines.length > 0) {
    warnings.push(`Found ${longLines.length} line(s) longer than 120 characters`);
  }
  
  // Check for proper semicolon usage
  const missingSemicolonRegex = /\n\s*(?:const|let|var|return|break|continue)\s+[^;]+\n/g;
  const missingSemicolons = code.match(missingSemicolonRegex);
  if (missingSemicolons && missingSemicolons.length > 5) {
    warnings.push(`Possible inconsistent semicolon usage detected`);
  }
  
  // Check for consistent indentation (spaces vs tabs)
  const hasSpaces = /^\s{2,}/m.test(code);
  const hasTabs = /^\t/m.test(code);
  if (hasSpaces && hasTabs) {
    issues.push('Mixed indentation detected (spaces and tabs)');
  }
  
  // Check for trailing whitespace
  const trailingWhitespace = /\s+$/gm;
  const trailingMatches = code.match(trailingWhitespace);
  if (trailingMatches && trailingMatches.length > 10) {
    warnings.push(`Found ${trailingMatches.length} line(s) with trailing whitespace`);
  }
  
  return {
    filename,
    issues,
    warnings,
    passed: issues.length === 0
  };
}

/**
 * Check for unused code
 * @param {string} code - Source code to check
 * @param {string} filename - Name of the file
 * @returns {Object} Results of unused code check
 */
export function checkUnusedCode(code, filename) {
  const issues = [];
  const warnings = [];
  
  // Find all function declarations
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;
  const functions = [];
  let match;
  
  while ((match = functionRegex.exec(code)) !== null) {
    functions.push(match[1]);
  }
  
  // Check if functions are used
  functions.forEach(funcName => {
    // Count occurrences (should be at least 2: declaration + usage)
    const regex = new RegExp(`\\b${funcName}\\b`, 'g');
    const occurrences = (code.match(regex) || []).length;
    
    if (occurrences === 1) {
      warnings.push(`Function '${funcName}' may be unused`);
    }
  });
  
  // Find all variable declarations
  const constRegex = /const\s+(\w+)\s*=/g;
  const letRegex = /let\s+(\w+)\s*=/g;
  const variables = [];
  
  while ((match = constRegex.exec(code)) !== null) {
    variables.push(match[1]);
  }
  
  while ((match = letRegex.exec(code)) !== null) {
    variables.push(match[1]);
  }
  
  // Check if variables are used (basic check)
  variables.forEach(varName => {
    // Skip common patterns
    if (varName === 'i' || varName === 'j' || varName === 'k' || varName === 'index') {
      return;
    }
    
    const regex = new RegExp(`\\b${varName}\\b`, 'g');
    const occurrences = (code.match(regex) || []).length;
    
    if (occurrences === 1) {
      warnings.push(`Variable '${varName}' may be unused`);
    }
  });
  
  // Check for commented out code blocks
  const commentedCodeRegex = /\/\/\s*(const|let|var|function|class|if|for|while)\s+/g;
  const commentedCode = code.match(commentedCodeRegex);
  if (commentedCode && commentedCode.length > 5) {
    warnings.push(`Found ${commentedCode.length} line(s) of commented out code. Consider removing`);
  }
  
  return {
    filename,
    functionsChecked: functions.length,
    variablesChecked: variables.length,
    issues,
    warnings,
    passed: issues.length === 0
  };
}

/**
 * Check variable and function naming conventions
 * @param {string} code - Source code to check
 * @param {string} filename - Name of the file
 * @returns {Object} Results of naming check
 */
export function checkNamingConventions(code, filename) {
  const issues = [];
  const warnings = [];
  
  // Check function names (should be camelCase)
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;
  let match;
  
  while ((match = functionRegex.exec(code)) !== null) {
    const funcName = match[1];
    
    // Check if starts with lowercase (camelCase)
    if (!/^[a-z]/.test(funcName)) {
      warnings.push(`Function '${funcName}' should start with lowercase (camelCase)`);
    }
    
    // Check for underscores (not recommended in camelCase)
    if (funcName.includes('_') && !funcName.startsWith('_')) {
      warnings.push(`Function '${funcName}' uses underscores. Consider camelCase`);
    }
  }
  
  // Check class names (should be PascalCase)
  const classRegex = /(?:export\s+)?class\s+(\w+)/g;
  
  while ((match = classRegex.exec(code)) !== null) {
    const className = match[1];
    
    // Check if starts with uppercase (PascalCase)
    if (!/^[A-Z]/.test(className)) {
      issues.push(`Class '${className}' should start with uppercase (PascalCase)`);
    }
  }
  
  // Check const names (UPPER_CASE for constants, camelCase for others)
  const constRegex = /const\s+([A-Z_][A-Z0-9_]*)\s*=/g;
  const upperCaseConsts = [];
  
  while ((match = constRegex.exec(code)) !== null) {
    upperCaseConsts.push(match[1]);
  }
  
  // Check for magic numbers
  const magicNumberRegex = /\b\d{2,}\b/g;
  const magicNumbers = code.match(magicNumberRegex);
  if (magicNumbers && magicNumbers.length > 10) {
    warnings.push(`Found ${magicNumbers.length} potential magic numbers. Consider using named constants`);
  }
  
  return {
    filename,
    issues,
    warnings,
    passed: issues.length === 0
  };
}

/**
 * Get line number from string index
 * @param {string} code - Source code
 * @param {number} index - Character index
 * @returns {number} Line number
 */
function getLineNumber(code, index) {
  return code.substring(0, index).split('\n').length;
}

/**
 * Run all code quality checks on a file
 * @param {string} code - Source code
 * @param {string} filename - Name of the file
 * @returns {Object} Combined results
 */
export function runAllChecks(code, filename) {
  console.log(`🔍 Checking code quality for: ${filename}`);
  
  const results = {
    filename,
    jsdoc: checkJSDocComments(code, filename),
    style: checkCodingStyle(code, filename),
    unused: checkUnusedCode(code, filename),
    naming: checkNamingConventions(code, filename),
    overall: true
  };
  
  // Determine overall pass/fail
  results.overall = results.jsdoc.passed && 
                    results.style.passed && 
                    results.unused.passed && 
                    results.naming.passed;
  
  // Count total issues and warnings
  results.totalIssues = 
    results.jsdoc.issues.length +
    results.style.issues.length +
    results.unused.issues.length +
    results.naming.issues.length;
  
  results.totalWarnings = 
    results.jsdoc.warnings.length +
    results.style.warnings.length +
    results.unused.warnings.length +
    results.naming.warnings.length;
  
  // Log summary
  if (results.totalIssues > 0) {
    console.warn(`  ❌ Found ${results.totalIssues} issue(s)`);
  }
  if (results.totalWarnings > 0) {
    console.log(`  ⚠️  Found ${results.totalWarnings} warning(s)`);
  }
  if (results.totalIssues === 0 && results.totalWarnings === 0) {
    console.log(`  ✅ No issues found`);
  }
  
  return results;
}

/**
 * Generate code quality report
 * @param {Object} results - Results from runAllChecks
 * @returns {string} HTML report
 */
export function generateQualityReport(results) {
  let html = '<div style="font-family: monospace; padding: 20px; background: #f5f5f5;">';
  html += `<h2 style="color: #333;">Code Quality Report: ${results.filename}</h2>`;
  
  // Overall status
  const statusColor = results.overall ? '#d4edda' : '#f8d7da';
  const statusText = results.overall ? '✅ Passed' : '❌ Issues Found';
  html += `<div style="padding: 10px; margin: 10px 0; background: ${statusColor}; border-radius: 5px;">`;
  html += `<strong>Overall Status:</strong> ${statusText}<br>`;
  html += `<strong>Total Issues:</strong> ${results.totalIssues}<br>`;
  html += `<strong>Total Warnings:</strong> ${results.totalWarnings}`;
  html += '</div>';
  
  // JSDoc Check
  html += generateCheckSection('JSDoc Comments', results.jsdoc);
  
  // Style Check
  html += generateCheckSection('Coding Style', results.style);
  
  // Unused Code Check
  html += generateCheckSection('Unused Code', results.unused);
  
  // Naming Conventions Check
  html += generateCheckSection('Naming Conventions', results.naming);
  
  html += '</div>';
  
  return html;
}

/**
 * Generate HTML section for a check
 * @param {string} title - Section title
 * @param {Object} checkResult - Check results
 * @returns {string} HTML section
 */
function generateCheckSection(title, checkResult) {
  const borderColor = checkResult.passed ? '#28a745' : '#dc3545';
  let html = `<div style="margin: 10px 0; padding: 10px; background: white; border-left: 4px solid ${borderColor};">`;
  html += `<strong>${checkResult.passed ? '✅' : '❌'} ${title}</strong><br>`;
  
  if (checkResult.issues && checkResult.issues.length > 0) {
    html += '<div style="margin-top: 10px;"><strong style="color: #dc3545;">Issues:</strong></div>';
    html += '<ul style="margin: 5px 0; padding-left: 20px;">';
    checkResult.issues.forEach(issue => {
      html += `<li style="color: #dc3545;">${issue}</li>`;
    });
    html += '</ul>';
  }
  
  if (checkResult.warnings && checkResult.warnings.length > 0) {
    html += '<div style="margin-top: 10px;"><strong style="color: #ffc107;">Warnings:</strong></div>';
    html += '<ul style="margin: 5px 0; padding-left: 20px;">';
    checkResult.warnings.forEach(warning => {
      html += `<li style="color: #856404;">${warning}</li>`;
    });
    html += '</ul>';
  }
  
  if (checkResult.issues.length === 0 && checkResult.warnings.length === 0) {
    html += '<div style="color: #28a745; margin-top: 5px;">No issues found</div>';
  }
  
  html += '</div>';
  
  return html;
}

/**
 * Batch check multiple files
 * @param {Array<{code: string, filename: string}>} files - Array of files to check
 * @returns {Object} Combined results
 */
export function batchCheckFiles(files) {
  console.log(`🔍 Running code quality checks on ${files.length} file(s)...`);
  
  const results = files.map(file => runAllChecks(file.code, file.filename));
  
  const summary = {
    totalFiles: files.length,
    filesWithIssues: results.filter(r => r.totalIssues > 0).length,
    filesWithWarnings: results.filter(r => r.totalWarnings > 0).length,
    totalIssues: results.reduce((sum, r) => sum + r.totalIssues, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.totalWarnings, 0),
    results
  };
  
  console.log('📊 Code Quality Summary:');
  console.log(`  Files checked: ${summary.totalFiles}`);
  console.log(`  Files with issues: ${summary.filesWithIssues}`);
  console.log(`  Files with warnings: ${summary.filesWithWarnings}`);
  console.log(`  Total issues: ${summary.totalIssues}`);
  console.log(`  Total warnings: ${summary.totalWarnings}`);
  
  return summary;
}
