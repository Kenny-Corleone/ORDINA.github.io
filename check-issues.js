/**
 * ORDINA Issue Checker
 * Automated script to detect common issues in the codebase
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Issue tracker
const issues = {
    critical: [],
    warning: [],
    info: []
};

console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                  ORDINA ISSUE CHECKER                         ║
║                  Task 16.3 - Bug Detection                    ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

// Check 1: Verify all required files exist
console.log(`\n${colors.blue}[1/10] Checking file structure...${colors.reset}`);
const requiredFiles = [
    'index.html',
    'js/main.js',
    'js/core/app.js',
    'js/core/router.js',
    'js/core/firebase.js',
    'css/main.css',
    'css/core/variables.css',
    'css/responsive/mobile.css',
    'css/responsive/tablet.css',
    'css/responsive/desktop.css'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ${colors.green}✓${colors.reset} ${file}`);
    } else {
        issues.critical.push(`Missing required file: ${file}`);
        console.log(`  ${colors.red}✗${colors.reset} ${file} - MISSING`);
    }
});

// Check 2: Verify viewport meta tag
console.log(`\n${colors.blue}[2/10] Checking viewport meta tag...${colors.reset}`);
if (fs.existsSync('index.html')) {
    const html = fs.readFileSync('index.html', 'utf8');
    if (html.includes('name="viewport"')) {
        console.log(`  ${colors.green}✓${colors.reset} Viewport meta tag found`);
    } else {
        issues.critical.push('Missing viewport meta tag in index.html');
        console.log(`  ${colors.red}✗${colors.reset} Viewport meta tag missing`);
    }
}

// Check 3: Check for duplicate CSS files
console.log(`\n${colors.blue}[3/10] Checking for duplicate CSS files...${colors.reset}`);
const cssFiles = [];
function findCSSFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findCSSFiles(filePath);
        } else if (file.endsWith('.css')) {
            cssFiles.push(filePath);
        }
    });
}
findCSSFiles('css');

const cssNames = cssFiles.map(f => path.basename(f));
const duplicates = cssNames.filter((name, index) => cssNames.indexOf(name) !== index);
if (duplicates.length > 0) {
    issues.warning.push(`Duplicate CSS files found: ${duplicates.join(', ')}`);
    console.log(`  ${colors.yellow}⚠${colors.reset} Duplicate files: ${duplicates.join(', ')}`);
} else {
    console.log(`  ${colors.green}✓${colors.reset} No duplicate CSS files`);
}

// Check 4: Verify ES6 module syntax
console.log(`\n${colors.blue}[4/10] Checking ES6 module syntax...${colors.reset}`);
const jsFiles = [
    'js/main.js',
    'js/core/app.js',
    'js/core/router.js'
];

jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasImport = content.includes('import ');
        const hasExport = content.includes('export ');
        if (hasImport || hasExport) {
            console.log(`  ${colors.green}✓${colors.reset} ${file} uses ES6 modules`);
        } else {
            issues.warning.push(`${file} may not be using ES6 modules`);
            console.log(`  ${colors.yellow}⚠${colors.reset} ${file} - No import/export found`);
        }
    }
});

// Check 5: Check for console.log statements (should be removed in production)
console.log(`\n${colors.blue}[5/10] Checking for console.log statements...${colors.reset}`);
let consoleLogCount = 0;
function countConsoleLogs(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !filePath.includes('node_modules')) {
            countConsoleLogs(filePath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = content.match(/console\.log\(/g);
            if (matches) {
                consoleLogCount += matches.length;
            }
        }
    });
}
countConsoleLogs('js');
if (consoleLogCount > 0) {
    issues.info.push(`Found ${consoleLogCount} console.log statements (consider removing for production)`);
    console.log(`  ${colors.yellow}ℹ${colors.reset} Found ${consoleLogCount} console.log statements`);
} else {
    console.log(`  ${colors.green}✓${colors.reset} No console.log statements found`);
}

// Check 6: Verify responsive breakpoints in CSS
console.log(`\n${colors.blue}[6/10] Checking responsive breakpoints...${colors.reset}`);
const breakpoints = ['320px', '480px', '640px', '768px', '1024px', '1440px'];
const responsiveFiles = [
    'css/responsive/mobile.css',
    'css/responsive/tablet.css',
    'css/responsive/desktop.css'
];

let foundBreakpoints = [];
responsiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        breakpoints.forEach(bp => {
            if (content.includes(bp)) {
                foundBreakpoints.push(bp);
            }
        });
    }
});

foundBreakpoints = [...new Set(foundBreakpoints)];
console.log(`  ${colors.green}✓${colors.reset} Found breakpoints: ${foundBreakpoints.join(', ')}`);
if (foundBreakpoints.length < 4) {
    issues.warning.push('Less than 4 breakpoints defined');
}

// Check 7: Check for touch target sizes
console.log(`\n${colors.blue}[7/10] Checking touch target optimization...${colors.reset}`);
if (fs.existsSync('css/responsive/mobile.css')) {
    const content = fs.readFileSync('css/responsive/mobile.css', 'utf8');
    if (content.includes('min-width: 44px') || content.includes('min-height: 44px')) {
        console.log(`  ${colors.green}✓${colors.reset} Touch target sizes defined (44px)`);
    } else {
        issues.warning.push('Touch target sizes (44px) not explicitly defined');
        console.log(`  ${colors.yellow}⚠${colors.reset} Touch target sizes not found`);
    }
}

// Check 8: Verify Firebase configuration
console.log(`\n${colors.blue}[8/10] Checking Firebase configuration...${colors.reset}`);
let firebaseConfigFound = false;
if (fs.existsSync('js/config.js')) {
    const configContent = fs.readFileSync('js/config.js', 'utf8');
    if (configContent.includes('apiKey') && configContent.includes('projectId')) {
        firebaseConfigFound = true;
    }
}
if (fs.existsSync('js/core/firebase.js')) {
    const firebaseContent = fs.readFileSync('js/core/firebase.js', 'utf8');
    if (firebaseContent.includes('firebaseConfig') || firebaseContent.includes('initializeApp')) {
        firebaseConfigFound = true;
    }
}
if (firebaseConfigFound) {
    console.log(`  ${colors.green}✓${colors.reset} Firebase config found and imported`);
} else {
    issues.critical.push('Firebase configuration may be incomplete');
    console.log(`  ${colors.red}✗${colors.reset} Firebase config incomplete`);
}

// Check 9: Check for API keys
console.log(`\n${colors.blue}[9/10] Checking API keys...${colors.reset}`);
if (fs.existsSync('js/config.js')) {
    const content = fs.readFileSync('js/config.js', 'utf8');
    if (content.includes('NEWSAPI_KEY')) {
        console.log(`  ${colors.green}✓${colors.reset} News API key defined`);
    } else {
        issues.warning.push('News API key not found in config.js');
        console.log(`  ${colors.yellow}⚠${colors.reset} News API key not found`);
    }
}

if (fs.existsSync('js/services/weather.service.js')) {
    const content = fs.readFileSync('js/services/weather.service.js', 'utf8');
    if (content.includes('91b705287b193e8debf755a8ff4cb0c7')) {
        console.log(`  ${colors.green}✓${colors.reset} Weather API key found`);
    } else {
        issues.warning.push('Weather API key not found or changed');
        console.log(`  ${colors.yellow}⚠${colors.reset} Weather API key not found`);
    }
}

// Check 10: Verify error handling
console.log(`\n${colors.blue}[10/10] Checking error handling...${colors.reset}`);
let errorHandlingCount = 0;
function countErrorHandling(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !filePath.includes('node_modules')) {
            countErrorHandling(filePath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const matches = content.match(/try\s*{|catch\s*\(/g);
            if (matches) {
                errorHandlingCount += matches.length / 2; // Divide by 2 since try-catch comes in pairs
            }
        }
    });
}
countErrorHandling('js');
console.log(`  ${colors.green}✓${colors.reset} Found ${Math.floor(errorHandlingCount)} try-catch blocks`);

// Summary
console.log(`\n${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                        SUMMARY                                ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

console.log(`${colors.red}Critical Issues: ${issues.critical.length}${colors.reset}`);
issues.critical.forEach(issue => console.log(`  • ${issue}`));

console.log(`\n${colors.yellow}Warnings: ${issues.warning.length}${colors.reset}`);
issues.warning.forEach(issue => console.log(`  • ${issue}`));

console.log(`\n${colors.blue}Info: ${issues.info.length}${colors.reset}`);
issues.info.forEach(issue => console.log(`  • ${issue}`));

// Overall status
console.log(`\n${colors.cyan}Overall Status:${colors.reset}`);
if (issues.critical.length === 0 && issues.warning.length === 0) {
    console.log(`${colors.green}✓ All checks passed! Application is ready for testing.${colors.reset}\n`);
    process.exit(0);
} else if (issues.critical.length === 0) {
    console.log(`${colors.yellow}⚠ Some warnings found. Review before deployment.${colors.reset}\n`);
    process.exit(0);
} else {
    console.log(`${colors.red}✗ Critical issues found. Fix before proceeding.${colors.reset}\n`);
    process.exit(1);
}
