/* Run every test file: node tests/all.js */
const { spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
let bad = 0;
for (const f of fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort()) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: 'utf8' });
  process.stdout.write(`${f}: ${r.stdout}${r.stderr}`);
  if (r.status !== 0) bad++;
}
console.log(bad ? `${bad} file(s) failed` : 'all ok');
process.exitCode = bad ? 1 : 0;
