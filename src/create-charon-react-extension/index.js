#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const { validateName, scaffoldProject } = require('./scaffold.js');

const TEMPLATE_DIR = path.join(__dirname, 'template');

async function promptName() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Extension name (e.g. my-extension): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  let name = process.argv[2]?.trim() ?? '';

  if (!name) {
    name = await promptName();
  }

  const error = validateName(name);
  if (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), name);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory "${name}" already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  try {
    scaffoldProject(name, targetDir, TEMPLATE_DIR);
  } catch (err) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.error(`Error during scaffolding: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n✓ Created ${name}/\n`);
  console.log('Next steps:');
  console.log(`  cd ${name}`);
  console.log('  npm install');
  console.log('  npm run dev');
}

main();
