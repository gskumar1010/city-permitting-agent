const fs = require('fs');
const data = fs.readFileSync(0, 'utf8');
try {
  const parsed = JSON.parse(data);
  if (Array.isArray(parsed)) {
    console.error('Parsed as array of length', parsed.length);
    process.exit(0);
  }
  console.error('Parsed as object with keys', Object.keys(parsed));
  if (Array.isArray(parsed.data)) {
    console.error('data is array length', parsed.data.length);
  } else {
    console.error('data typeof', typeof parsed.data);
  }
} catch (err) {
  console.error('Failed to parse JSON', err.message);
  process.exit(1);
}
