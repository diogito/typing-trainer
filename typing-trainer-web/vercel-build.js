#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installing with npm...');
execSync('npm install', { stdio: 'inherit' });

console.log('🔨 Building with vite...');
execSync('npx tsc -b && npx vite build', { stdio: 'inherit' });

console.log('✅ Build complete!');
