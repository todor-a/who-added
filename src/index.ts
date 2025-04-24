#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
    options: {
        dependency: {
            short: 'd',
            type: 'string',
        },
        file: {
            short: 'f',
            type: 'string',
            default: 'package.json',
        },
    },
    strict: false,
    allowPositionals: true,
});

const dep = values.dependency || positionals[0];
const file = values.file ?? 'package.json';

if (!dep) {
    console.error('Error: dependency name is required.');
    console.error('Usage: who-added --dependency react [--file package.json]');
    process.exit(1);
}

const gitCmd = [
    'git',
    'log',
    '--reverse',
    `-S'"${dep}\":'`,
    "--pretty=format:'%H %an %ad %s'",
    '--',
    file,
].join(' ');

try {
    const output = execSync(gitCmd, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
    });
    const firstLine = output.split('\n')[0];
    if (!firstLine) {
        console.log(
            `No commits found adding or removing '"${dep}\":' in ${file}.`,
        );
    } else {
        console.log('First commit introducing dependency:');
        console.log(firstLine);
    }
} catch (err) {
    console.error('Error running git command:', err);
    process.exit(1);
}
