import fs from 'fs';
import path from 'path';

const docPath = path.resolve('Documents', 'Quality_and_Maintenance.md');

const template = `- **Unit (Vitest):** update after latest test run.\n- **Build (Vite):** update after latest build.\n- **Lint:** update after latest lint run.\n`;

const content = fs.readFileSync(docPath, 'utf8');
const start = '<!-- last-run:start -->';
const end = '<!-- last-run:end -->';

if (!content.includes(start) || !content.includes(end)) {
  console.error('Missing last-run markers in Quality_and_Maintenance.md');
  process.exit(1);
}

const updated = content.replace(
  new RegExp(`${start}[\\s\\S]*?${end}`),
  `${start}\n${template}${end}`
);

fs.writeFileSync(docPath, updated);
console.log('Updated last-run block in Documents/Quality_and_Maintenance.md');
