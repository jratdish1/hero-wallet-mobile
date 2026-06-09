describe('Repository Health', () => {
  test('package.json is valid', () => {
    const pkg = require('../package.json');
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
  });

  test('no hardcoded secrets in source', () => {
    const fs = require('fs');
    const path = require('path');
    const srcDirs = ['src', 'lib', 'scripts'].filter(d => fs.existsSync(path.join(__dirname, '..', d)));
    srcDirs.forEach(dir => {
      const dirPath = path.join(__dirname, '..', dir);
      const files = fs.readdirSync(dirPath).filter(f => /\.(ts|js|mjs)$/.test(f));
      files.forEach(file => {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
        expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      });
    });
  });
});
