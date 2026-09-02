#!/usr/bin/env node
/**
 * Loads mcp-deploy-args.json and prints JSON for deploy_to_vercel invocation.
 * Usage: node run-mcp-deploy.js | wc -c
 */
const fs = require('fs');
const path = require('path');

const argsPath = path.join(__dirname, 'mcp-deploy-args.json');
const args = JSON.parse(fs.readFileSync(argsPath, 'utf8'));

const summary = {
  target: args.target,
  name: args.name,
  teamId: args.teamId,
  fileCount: args.files.length,
  hasLock: args.files.some((f) => f.file === 'package-lock.json'),
  binaryCount: args.files.filter((f) => f.encoding === 'base64').length,
};
console.error(JSON.stringify(summary));
process.stdout.write(JSON.stringify(args));
