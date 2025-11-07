const fs = require('fs');
const path = require('path');

// Thư mục gốc chứa các file SVG
const iconsDir = __dirname
const outputFile = path.join(__dirname, 'result.json');

// Hàm đọc tất cả SVG files
function readAllSvgFiles(dir, basePath = '') {
  const result = {};
  
  // Đọc tất cả items trong thư mục
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Nếu là thư mục, đệ quy vào bên trong
      const subResults = readAllSvgFiles(fullPath, path.join(basePath, item.name));
      Object.assign(result, subResults);
    } else if (item.isFile() && item.name.endsWith('.svg')) {
      // Nếu là file SVG, đọc nội dung
      const svgContent = fs.readFileSync(fullPath, 'utf-8');
      const fileName = item.name.replace('.svg', '');
      const key = basePath ? `${basePath}/${fileName}` : fileName;
      result[key] = svgContent;
    }
  }
  
  return result;
}

// Đọc tất cả SVG files
const svgData = readAllSvgFiles(iconsDir);

// Ghi vào file result.json
fs.writeFileSync(outputFile, JSON.stringify(svgData, null, 2), 'utf-8');
