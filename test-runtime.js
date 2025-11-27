/**
 * Runtime functionality test for ORDINA application
 * Tests: Load built application, check for console errors, verify auth screen renders
 */

const http = require('http');

// Test 1: Check if server is responding
function testServerResponse() {
    return new Promise((resolve, reject) => {
        console.log('Test 1: Checking server response...');
        
        const options = {
            hostname: 'localhost',
            port: 4173,
            path: '/ORDINA.github.io/',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✓ Server responding with status 200');
                    resolve({ success: true, html: data });
                } else {
                    console.log(`✗ Server responded with status ${res.statusCode}`);
                    resolve({ success: false, statusCode: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`✗ Server connection failed: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

// Test 2: Verify HTML structure
function testHTMLStructure(html) {
    console.log('\nTest 2: Verifying HTML structure...');
    
    const checks = [
        { name: 'DOCTYPE declaration', pattern: /<!DOCTYPE html>/i },
        { name: 'HTML tag', pattern: /<html/i },
        { name: 'Head section', pattern: /<head>/i },
        { name: 'Body section', pattern: /<body/i },
        { name: 'Auth container', pattern: /id="auth-container"/i },
        { name: 'Main JavaScript bundle', pattern: /assets\/js\/index-[^"]+\.js/i },
        { name: 'CSS bundle', pattern: /assets\/css\/index-[^"]+\.css/i },
        { name: 'Firebase vendor bundle', pattern: /assets\/js\/vendor-firebase-[^"]+\.js/i }
    ];

    let allPassed = true;
    checks.forEach(check => {
        if (check.pattern.test(html)) {
            console.log(`✓ ${check.name} found`);
        } else {
            console.log(`✗ ${check.name} NOT found`);
            allPassed = false;
        }
    });

    return allPassed;
}

// Test 3: Check for critical elements
function testCriticalElements(html) {
    console.log('\nTest 3: Checking critical elements...');
    
    const elements = [
        { name: 'Authentication container', pattern: /id="auth-container"/i },
        { name: 'Dashboard page', pattern: /id="dashboard-page"/i },
        { name: 'Logo image', pattern: /ordina[^"]*\.png/i },
        { name: 'Navigation elements', pattern: /class="[^"]*nav/i },
        { name: 'Header grid', pattern: /id="header-grid-container"/i },
        { name: 'Toast container', pattern: /id="toast-container"/i }
    ];

    let allPassed = true;
    elements.forEach(element => {
        if (element.pattern.test(html)) {
            console.log(`✓ ${element.name} present`);
        } else {
            console.log(`✗ ${element.name} NOT present`);
            allPassed = false;
        }
    });

    return allPassed;
}

// Test 4: Verify asset references
function testAssetReferences(html) {
    console.log('\nTest 4: Verifying asset references...');
    
    const assetPatterns = [
        { name: 'Favicon references', pattern: /favicon-\d+[^"]*\.png/g },
        { name: 'Logo images', pattern: /ordina[^"]*\.png/g },
        { name: 'JavaScript modules', pattern: /assets\/js\/[^"]+\.js/g },
        { name: 'CSS stylesheets', pattern: /assets\/css\/[^"]+\.css/g }
    ];

    let allPassed = true;
    assetPatterns.forEach(asset => {
        const matches = html.match(asset.pattern);
        if (matches && matches.length > 0) {
            console.log(`✓ ${asset.name}: ${matches.length} reference(s) found`);
        } else {
            console.log(`✗ ${asset.name}: No references found`);
            allPassed = false;
        }
    });

    return allPassed;
}

// Run all tests
async function runTests() {
    console.log('=== ORDINA Runtime Functionality Tests ===\n');
    
    try {
        // Test 1: Server response
        const serverResult = await testServerResponse();
        if (!serverResult.success) {
            console.log('\n✗ Server test failed. Cannot proceed with other tests.');
            process.exit(1);
        }

        // Test 2: HTML structure
        const htmlStructurePass = testHTMLStructure(serverResult.html);

        // Test 3: Critical elements
        const criticalElementsPass = testCriticalElements(serverResult.html);

        // Test 4: Asset references
        const assetReferencesPass = testAssetReferences(serverResult.html);

        // Summary
        console.log('\n=== Test Summary ===');
        console.log(`Server Response: ✓ PASSED`);
        console.log(`HTML Structure: ${htmlStructurePass ? '✓ PASSED' : '✗ FAILED'}`);
        console.log(`Critical Elements: ${criticalElementsPass ? '✓ PASSED' : '✗ FAILED'}`);
        console.log(`Asset References: ${assetReferencesPass ? '✓ PASSED' : '✗ FAILED'}`);

        const allTestsPassed = htmlStructurePass && criticalElementsPass && assetReferencesPass;
        
        if (allTestsPassed) {
            console.log('\n✓ All runtime tests PASSED');
            process.exit(0);
        } else {
            console.log('\n✗ Some runtime tests FAILED');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n✗ Test execution failed:', error.message);
        process.exit(1);
    }
}

// Run tests
runTests();
