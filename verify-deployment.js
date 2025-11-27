/**
 * Deployment Verification Script
 * 
 * This script helps verify that the correct files are being served.
 * Run this in the browser console on the deployed site.
 */

(function() {
    console.log('🔍 ORDINA Deployment Verification\n');
    console.log('=' .repeat(50));
    
    // Check loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const scriptSources = scripts.map(s => s.src);
    
    console.log('\n📦 Loaded JavaScript Files:');
    scriptSources.forEach((src, i) => {
        const isOldAngular = src.includes('main-es2015') || src.includes('polyfills-es2015');
        const isNewVite = src.includes('index-') || src.includes('vendor-');
        
        let status = '❓ Unknown';
        if (isOldAngular) status = '❌ OLD ANGULAR';
        else if (isNewVite) status = '✅ NEW VITE';
        
        console.log(`${i + 1}. ${status} - ${src}`);
    });
    
    // Check for Angular indicators
    console.log('\n🔍 Angular Detection:');
    const hasAngular = typeof window.ng !== 'undefined' || 
                      document.querySelector('[ng-version]') ||
                      scriptSources.some(s => s.includes('main-es2015'));
    
    if (hasAngular) {
        console.log('❌ OLD ANGULAR APP DETECTED');
        if (window.ng) console.log('   - window.ng exists:', window.ng);
        if (document.querySelector('[ng-version]')) {
            console.log('   - ng-version attribute found');
        }
    } else {
        console.log('✅ No Angular detected (Good!)');
    }
    
    // Check for Vite indicators
    console.log('\n⚡ Vite Detection:');
    const hasVite = scriptSources.some(s => s.includes('index-') && s.includes('.js')) ||
                   document.querySelector('script[type="module"]');
    
    if (hasVite) {
        console.log('✅ VITE APP DETECTED');
    } else {
        console.log('❌ No Vite detected');
    }
    
    // Check base href
    console.log('\n🔗 Base URL:');
    const base = document.querySelector('base');
    if (base) {
        console.log(`   href: ${base.href}`);
        const isCorrect = base.href.includes('/ORDINA.github.io/');
        console.log(isCorrect ? '✅ Correct base path' : '❌ Wrong base path');
    } else {
        console.log('❌ No <base> tag found');
    }
    
    // Check for errors in console
    console.log('\n⚠️  Console Errors Summary:');
    console.log('   (Check the console above for errors)');
    
    // Check Chart.js
    console.log('\n📊 Chart.js Status:');
    if (typeof Chart !== 'undefined') {
        console.log('✅ Chart.js loaded');
    } else {
        console.log('⏳ Chart.js not loaded yet (may load lazily)');
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(50));
    console.log('📋 VERDICT:');
    
    const isOldApp = hasAngular || scriptSources.some(s => s.includes('main-es2015'));
    const isNewApp = hasVite && !isOldApp;
    
    if (isOldApp) {
        console.log('❌ OLD ANGULAR APP IS BEING SERVED');
        console.log('\n🔧 ACTION REQUIRED:');
        console.log('1. Check GitHub Pages settings:');
        console.log('   https://github.com/Kenny-Corleone/ORDINA.github.io/settings/pages');
        console.log('2. Ensure Source = "GitHub Actions" (not "Deploy from a branch")');
        console.log('3. Check GitHub Actions:');
        console.log('   https://github.com/Kenny-Corleone/ORDINA.github.io/actions');
        console.log('4. See OLD_ANGULAR_PROBLEM.md for detailed fix');
    } else if (isNewApp) {
        console.log('✅ NEW VITE APP IS BEING SERVED');
        console.log('   Everything looks good!');
    } else {
        console.log('❓ UNCLEAR - Manual inspection needed');
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Return summary for programmatic use
    return {
        isOldAngular: isOldApp,
        isNewVite: isNewApp,
        scripts: scriptSources,
        baseHref: base ? base.href : null,
        hasChartJs: typeof Chart !== 'undefined'
    };
})();

