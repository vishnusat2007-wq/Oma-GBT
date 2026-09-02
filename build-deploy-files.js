#!/usr/bin/env node
/**
 * Build files array for Vercel deploy_to_vercel MCP tool.
 * Excludes: node_modules, .next, .git, .vercel, test-results
 * Binary files encoded as base64.
 */
const fs = require('fs');
const path = require('path');

const ROOT = '/workspace';
const OUTPUT = path.join(ROOT, 'deploy-files.json');

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.vercel',
  'test-results',
]);

const EXCLUDE_FILES = new Set([
  'deploy-files.json',
  'build-deploy-files.js',
  'deploy-payload.json',
  'deploy-via-mcp.js',
  'mcp-deploy-args.json',
  'invoke-deploy-to-vercel.js',
  'run-mcp-deploy.js',
  'tsconfig.tsbuildinfo',
]);

const EXCLUDE_PATTERNS = [/^chunk-\d+\.txt$/];

const BINARY_EXTENSIONS = new Set([
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.pdf',
  '.zip',
  '.gz',
  '.mp3',
  '.mp4',
  '.wav',
  '.webm',
  '.avif',
]);

function isBinaryFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return true;
  // Heuristic: check for null bytes in first 8KB
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(8192);
    const bytesRead = fs.readSync(fd, buf, 0, 8192, 0);
    fs.closeSync(fd);
    for (let i = 0; i < bytesRead; i++) {
      if (buf[i] === 0) return true;
    }
  } catch {
    return false;
  }
  return false;
}

function walk(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, fullPath).split(path.sep).join('/');

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(fullPath, files);
    } else if (entry.isFile()) {
      if (EXCLUDE_FILES.has(entry.name)) continue;
      if (EXCLUDE_PATTERNS.some((re) => re.test(entry.name))) continue;
      const stat = fs.statSync(fullPath);
      const binary = isBinaryFile(fullPath);
      const fileEntry = { file: relPath };

      if (binary) {
        fileEntry.data = fs.readFileSync(fullPath).toString('base64');
        fileEntry.encoding = 'base64';
      } else {
        fileEntry.data = fs.readFileSync(fullPath, 'utf8');
      }

      files.push(fileEntry);
      process.stderr.write(`Added: ${relPath} (${stat.size} bytes${binary ? ', base64' : ''})\n`);
    }
  }

  return files;
}

const files = walk(ROOT);
const hasLock = files.some((f) => f.file === 'package-lock.json');
if (!hasLock && fs.existsSync(path.join(ROOT, 'package-lock.json'))) {
  throw new Error('package-lock.json exists but was not included');
}

const payload = { files, count: files.length };
fs.writeFileSync(OUTPUT, JSON.stringify(payload));
const sizeMB = (fs.statSync(OUTPUT).size / (1024 * 1024)).toFixed(2);
console.log(JSON.stringify({ output: OUTPUT, fileCount: files.length, sizeMB, hasLock }));
