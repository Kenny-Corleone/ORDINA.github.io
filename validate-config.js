// Configuration Validation Script
// This script verifies that Firebase and API configurations remain intact

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Expected Firebase configuration values
const EXPECTED_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDi0cFirxRJ9eC6mvy1WEDpB9MPzDDac3g",
    authDomain: "life-order-assistant.firebaseapp.com",
    projectId: "life-order-assistant",
    storageBucket: "life-order-assistant.appspot.com",
    messagingSenderId: "284691407205",
    appId: "1:284691407205:web:a6e935c498b280ce55c18c",
    measurementId: "G-E1MWRNNKDM"
};

// Expected OpenWeatherMap API key
const EXPECTED_OPENWEATHER_KEY = "91b705287b193e8debf755a8ff4cb0c7";

const results = {
    passed: [],
    failed: [],
    warnings: []
};

function validateFirebaseConfig() {
    console.log('\n🔍 Validating Firebase Configuration...');
    
    try {
        const firebaseContent = readFileSync(join(__dirname, 'src/js/firebase.js'), 'utf-8');
        
        // Check each configuration value
        let allValid = true;
        
        for (const [key, expectedValue] of Object.entries(EXPECTED_FIREBASE_CONFIG)) {
            const regex = new RegExp(`${key}:\\s*["']([^"']+)["']`);
            const match = firebaseContent.match(regex);
            
            if (!match) {
                results.failed.push(`❌ Firebase config missing: ${key}`);
                allValid = false;
            } else if (match[1] !== expectedValue) {
                results.failed.push(`❌ Firebase config mismatch: ${key}`);
                results.failed.push(`   Expected: ${expectedValue}`);
                results.failed.push(`   Found: ${match[1]}`);
                allValid = false;
            } else {
                results.passed.push(`✅ Firebase ${key}: intact`);
            }
        }
        
        // Verify imports are correct
        if (!firebaseContent.includes('import { initializeApp } from "firebase/app"')) {
            results.warnings.push(`⚠️  Firebase import statement may have changed`);
        }
        
        if (!firebaseContent.includes('import { getAuth } from "firebase/auth"')) {
            results.warnings.push(`⚠️  Firebase auth import may have changed`);
        }
        
        if (!firebaseContent.includes('import { getFirestore } from "firebase/firestore"')) {
            results.warnings.push(`⚠️  Firebase firestore import may have changed`);
        }
        
        // Verify exports
        if (!firebaseContent.includes('export { app, db, auth }')) {
            results.warnings.push(`⚠️  Firebase exports may have changed`);
        }
        
        if (allValid) {
            console.log('✅ Firebase configuration is intact');
        } else {
            console.log('❌ Firebase configuration has issues');
        }
        
        return allValid;
    } catch (error) {
        results.failed.push(`❌ Error reading firebase.js: ${error.message}`);
        console.log('❌ Error validating Firebase configuration');
        return false;
    }
}

function validateOpenWeatherKey() {
    console.log('\n🔍 Validating OpenWeatherMap API Key...');
    
    try {
        const weatherContent = readFileSync(join(__dirname, 'src/js/weather.js'), 'utf-8');
        
        const keyRegex = /OPENWEATHER_API_KEY\s*=\s*['"]([^'"]+)['"]/;
        const match = weatherContent.match(keyRegex);
        
        if (!match) {
            results.failed.push(`❌ OpenWeatherMap API key not found`);
            console.log('❌ OpenWeatherMap API key not found');
            return false;
        }
        
        if (match[1] !== EXPECTED_OPENWEATHER_KEY) {
            results.failed.push(`❌ OpenWeatherMap API key mismatch`);
            results.failed.push(`   Expected: ${EXPECTED_OPENWEATHER_KEY}`);
            results.failed.push(`   Found: ${match[1]}`);
            console.log('❌ OpenWeatherMap API key has changed');
            return false;
        }
        
        results.passed.push(`✅ OpenWeatherMap API key: intact`);
        console.log('✅ OpenWeatherMap API key is intact');
        return true;
    } catch (error) {
        results.failed.push(`❌ Error reading weather.js: ${error.message}`);
        console.log('❌ Error validating OpenWeatherMap API key');
        return false;
    }
}

function validateNewsFeeds() {
    console.log('\n🔍 Validating News Feed Endpoints...');
    
    try {
        const newsContent = readFileSync(join(__dirname, 'src/js/news.js'), 'utf-8');
        
        // Check that RSS_SOURCES object exists
        if (!newsContent.includes('const RSS_SOURCES = {')) {
            results.failed.push(`❌ RSS_SOURCES configuration not found`);
            console.log('❌ RSS_SOURCES configuration not found');
            return false;
        }
        
        // Check for key RSS sources
        const expectedSources = [
            'lenta.ru/rss',
            'oxu.az/rss',
            'rss.cnn.com/rss/edition.rss'
        ];
        
        let allFound = true;
        for (const source of expectedSources) {
            if (!newsContent.includes(source)) {
                results.warnings.push(`⚠️  RSS source may be missing: ${source}`);
                allFound = false;
            }
        }
        
        if (allFound) {
            results.passed.push(`✅ News feed endpoints: intact`);
            console.log('✅ News feed endpoints are intact');
        } else {
            console.log('⚠️  Some news feed endpoints may have changed');
        }
        
        return true;
    } catch (error) {
        results.failed.push(`❌ Error reading news.js: ${error.message}`);
        console.log('❌ Error validating news feed endpoints');
        return false;
    }
}

function printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 CONFIGURATION VALIDATION REPORT');
    console.log('='.repeat(60));
    
    if (results.passed.length > 0) {
        console.log('\n✅ PASSED CHECKS:');
        results.passed.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        results.warnings.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (results.failed.length > 0) {
        console.log('\n❌ FAILED CHECKS:');
        results.failed.forEach(msg => console.log(`   ${msg}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    const totalChecks = results.passed.length + results.failed.length;
    const passRate = totalChecks > 0 ? ((results.passed.length / totalChecks) * 100).toFixed(1) : 0;
    
    console.log(`\n📊 Summary: ${results.passed.length}/${totalChecks} checks passed (${passRate}%)`);
    console.log(`   Warnings: ${results.warnings.length}`);
    
    if (results.failed.length === 0) {
        console.log('\n✅ All critical configurations are intact!');
        return true;
    } else {
        console.log('\n❌ Some configurations have been modified!');
        return false;
    }
}

// Run all validations
async function main() {
    console.log('🚀 Starting Configuration Validation...');
    
    const firebaseValid = validateFirebaseConfig();
    const weatherValid = validateOpenWeatherKey();
    const newsValid = validateNewsFeeds();
    
    const allValid = printReport();
    
    process.exit(allValid ? 0 : 1);
}

main();
