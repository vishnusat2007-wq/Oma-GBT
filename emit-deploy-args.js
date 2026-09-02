#!/usr/bin/env node
/**
 * Invoke deploy_to_vercel by printing arguments for MCP tool consumption.
 * Agent should pipe this to CallDynamicTool or use the JSON output.
 */
const fs = require('fs');
const path = require('path');

const argsPath = path.join(__dirname, 'mcp-deploy-args.json');
const args = JSON.parse(fs.readFileSync(argsPath, 'utf8'));

// Ensure correct deploy target
args.name = 'oma-gbt-deploy-26d4';
args.target = 'production';
args.teamId = 'team_WIAbrk05yBEygKyDO5a0AfiG';

process.stdout.write(JSON.stringify(args));
