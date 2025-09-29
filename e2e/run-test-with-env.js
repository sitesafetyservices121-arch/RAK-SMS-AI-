// e2e/run-test-with-env.js
require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');

const child = exec('bash e2e/api-login.sh', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
