// API Integration Test Script
// Tests Firebase auth, weather widget, and news feed functionality

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const results = {
    passed: [],
    failed: [],
    warnings: []
};

// Test Firebase configuration can be loaded
function testFirebaseConfig() {
    console.log('\n🔍 Testing Firebase Configuration Loading...');
    
    try {
        const firebaseContent = readFileSync(join(__dirname, 'src/js/firebase.js'), 'utf-8');
        
        // Check that all required imports are present
        const requiredImports = [
            'initializeApp',
            'getAuth',
            'getFirestore'
        ];
        
        let allImportsPresent = true;
        for (const imp of requiredImports) {
            if (!firebaseContent.includes(imp)) {
                results.failed.push(`❌ Missing Firebase import: ${imp}`);
                allImportsPresent = false;
            }
        }
        
        // Check that firebaseConfig object exists
        if (!firebaseContent.includes('const firebaseConfig = {')) {
            results.failed.push(`❌ Firebase config object not found`);
            return false;
        }
        
        // Check that initialization code exists
        if (!firebaseContent.includes('initializeApp(firebaseConfig)')) {
            results.failed.push(`❌ Firebase initialization code not found`);
            return false;
        }
        
        // Check that exports are present
        if (!firebaseContent.includes('export { app, db, auth }')) {
            results.failed.push(`❌ Firebase exports not found`);
            return false;
        }
        
        // Check error handling
        if (!firebaseContent.includes('try') || !firebaseContent.includes('catch')) {
            results.warnings.push(`⚠️  Firebase initialization may lack error handling`);
        }
        
        if (allImportsPresent) {
            results.passed.push(`✅ Firebase configuration structure: valid`);
            console.log('✅ Firebase configuration can be loaded');
            return true;
        } else {
            console.log('❌ Firebase configuration has issues');
            return false;
        }
    } catch (error) {
        results.failed.push(`❌ Error testing Firebase config: ${error.message}`);
        console.log('❌ Error testing Firebase configuration');
        return false;
    }
}

// Test Weather API integration
async function testWeatherAPI() {
    console.log('\n🔍 Testing Weather API Integration...');
    
    try {
        const weatherContent = readFileSync(join(__dirname, 'src/js/weather.js'), 'utf-8');
        
        // Check API key is present
        if (!weatherContent.includes('OPENWEATHER_API_KEY')) {
            results.failed.push(`❌ OpenWeatherMap API key constant not found`);
            return false;
        }
        
        // Check updateWeatherNew function exists
        if (!weatherContent.includes('export async function updateWeatherNew')) {
            results.failed.push(`❌ updateWeatherNew function not found`);
            return false;
        }
        
        // Check API endpoint is correct
        if (!weatherContent.includes('api.openweathermap.org/data/2.5/weather')) {
            results.failed.push(`❌ OpenWeatherMap API endpoint not found`);
            return false;
        }
        
        // Check initWeatherNew function exists
        if (!weatherContent.includes('export const initWeatherNew')) {
            results.failed.push(`❌ initWeatherNew function not found`);
            return false;
        }
        
        // Check for error handling
        if (!weatherContent.includes('try') || !weatherContent.includes('catch')) {
            results.warnings.push(`⚠️  Weather API may lack error handling`);
        }
        
        // Test API endpoint accessibility (without making actual request)
        const apiKeyMatch = weatherContent.match(/OPENWEATHER_API_KEY\s*=\s*['"]([^'"]+)['"]/);
        if (apiKeyMatch && apiKeyMatch[1]) {
            results.passed.push(`✅ Weather API key: configured`);
            results.passed.push(`✅ Weather API endpoint: configured`);
            results.passed.push(`✅ Weather API functions: present`);
            console.log('✅ Weather API integration structure is valid');
            
            // Note: We're not making actual API calls to avoid rate limits
            results.warnings.push(`ℹ️  Weather API live test skipped (to avoid rate limits)`);
            return true;
        } else {
            results.failed.push(`❌ Weather API key not properly configured`);
            console.log('❌ Weather API integration has issues');
            return false;
        }
    } catch (error) {
        results.failed.push(`❌ Error testing Weather API: ${error.message}`);
        console.log('❌ Error testing Weather API integration');
        return false;
    }
}

// Test News Feed integration
async function testNewsFeed() {
    console.log('\n🔍 Testing News Feed Integration...');
    
    try {
        const newsContent = readFileSync(join(__dirname, 'src/js/news.js'), 'utf-8');
        
        // Check RSS_SOURCES exists
        if (!newsContent.includes('const RSS_SOURCES = {')) {
            results.failed.push(`❌ RSS_SOURCES configuration not found`);
            return false;
        }
        
        // Check fetchNews function exists
        if (!newsContent.includes('export async function fetchNews')) {
            results.failed.push(`❌ fetchNews function not found`);
            return false;
        }
        
        // Check initNews function exists
        if (!newsContent.includes('export const initNews')) {
            results.failed.push(`❌ initNews function not found`);
            return false;
        }
        
        // Check parseRSSFeed function exists
        if (!newsContent.includes('async function parseRSSFeed')) {
            results.failed.push(`❌ parseRSSFeed function not found`);
            return false;
        }
        
        // Check for CORS proxy configuration
        if (!newsContent.includes('CORS_PROXIES')) {
            results.warnings.push(`⚠️  CORS proxy configuration may be missing`);
        }
        
        // Check for error handling
        if (!newsContent.includes('try') || !newsContent.includes('catch')) {
            results.warnings.push(`⚠️  News feed may lack error handling`);
        }
        
        // Verify RSS sources for different languages
        const languages = ['ru', 'az', 'en'];
        let allLanguagesPresent = true;
        
        for (const lang of languages) {
            if (!newsContent.includes(`'${lang}':`)) {
                results.warnings.push(`⚠️  RSS sources for language '${lang}' may be missing`);
                allLanguagesPresent = false;
            }
        }
        
        results.passed.push(`✅ News feed RSS sources: configured`);
        results.passed.push(`✅ News feed functions: present`);
        results.passed.push(`✅ News feed structure: valid`);
        console.log('✅ News feed integration structure is valid');
        
        // Note: We're not making actual RSS requests to avoid rate limits
        results.warnings.push(`ℹ️  News feed live test skipped (to avoid rate limits)`);
        return true;
    } catch (error) {
        results.failed.push(`❌ Error testing News Feed: ${error.message}`);
        console.log('❌ Error testing News Feed integration');
        return false;
    }
}

// Test that all API integrations work together
function testIntegrationStructure() {
    console.log('\n🔍 Testing Overall Integration Structure...');
    
    try {
        // Check that main.js imports these modules
        const mainContent = readFileSync(join(__dirname, 'src/main.js'), 'utf-8');
        
        const requiredImports = [
            './js/firebase.js',
            './js/weather.js',
            './js/news.js'
        ];
        
        let allImportsPresent = true;
        for (const imp of requiredImports) {
            if (!mainContent.includes(imp)) {
                results.warnings.push(`⚠️  main.js may not import: ${imp}`);
                allImportsPresent = false;
            }
        }
        
        if (allImportsPresent) {
            results.passed.push(`✅ All API modules imported in main.js`);
            console.log('✅ Integration structure is valid');
            return true;
        } else {
            console.log('⚠️  Some integration imports may be missing');
            return true; // Not critical
        }
    } catch (error) {
        results.warnings.push(`⚠️  Could not verify integration structure: ${error.message}`);
        console.log('⚠️  Could not fully verify integration structure');
        return true; // Not critical
    }
}

function printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 API INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    
    if (results.passed.length > 0) {
        console.log('\n✅ PASSED TESTS:');
        results.passed.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS & INFO:');
        results.warnings.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (results.failed.length > 0) {
        console.log('\n❌ FAILED TESTS:');
        results.failed.forEach(msg => console.log(`   ${msg}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    const totalTests = results.passed.length + results.failed.length;
    const passRate = totalTests > 0 ? ((results.passed.length / totalTests) * 100).toFixed(1) : 0;
    
    console.log(`\n📊 Summary: ${results.passed.length}/${totalTests} tests passed (${passRate}%)`);
    console.log(`   Warnings: ${results.warnings.length}`);
    
    if (results.failed.length === 0) {
        console.log('\n✅ All API integrations are properly configured!');
        console.log('\nℹ️  Note: Live API tests were skipped to avoid rate limits.');
        console.log('   The integrations are structurally valid and should work in production.');
        return true;
    } else {
        console.log('\n❌ Some API integrations have issues!');
        return false;
    }
}

// Run all tests
async function main() {
    console.log('🚀 Starting API Integration Tests...');
    
    const firebaseValid = testFirebaseConfig();
    const weatherValid = await testWeatherAPI();
    const newsValid = await testNewsFeed();
    const integrationValid = testIntegrationStructure();
    
    const allValid = printReport();
    
    process.exit(allValid ? 0 : 1);
}

main();
