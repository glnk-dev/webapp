import { sync } from 'replace-in-file';
const result = sync({
  files: 'build/index.html',
  from: /<%= REACT_APP_GLNK_USERNAME %>/g,
  to: process.env.REACT_APP_GLNK_USERNAME || 'default',
});

console.log('Replacement results:', result);
