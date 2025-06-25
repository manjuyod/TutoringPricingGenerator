
import fs from 'fs';
import path from 'path';

// Read the PNG file and convert to base64
const logoPath = path.join(process.cwd(), 'attached_assets', 'TC Horizontal.png');
const b64 = fs.readFileSync(logoPath, 'base64');

// Export the base64 logo
export const LOGO_B64 = "data:image/png;base64," + b64;

// Write to a generated assets file
const outputPath = path.join(process.cwd(), 'client', 'src', 'lib', 'generatedAssets.ts');
const content = `// Auto-generated file - do not edit manually
export const LOGO_B64 = "data:image/png;base64,${b64}";
`;

fs.writeFileSync(outputPath, content);
console.log('Generated logo base64 asset');
