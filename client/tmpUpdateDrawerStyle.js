const fs = require('fs');
const path = 'src/components/dashboard/css/admin.css';
let text = fs.readFileSync(path, 'utf8');
const mainStart = text.indexOf('.mainAdmin{');
if (mainStart === -1) {
  console.error('mainAdmin not found');
  process.exit(1);
}
const mainEnd = text.indexOf('}', mainStart) + 1;
if (mainEnd === 0) {
  console.error('mainAdmin closing brace not found');
  process.exit(1);
}
const snippet = `
.user-profile-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 500px;
    background: #fff;
    box-shadow: -4px 0 20px rgba(0,0,0,0.15);
    z-index: 50;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
}

.user-profile-drawer .close-btn {
    width: 32px;
    height: 32px;
}

.user-profile-drawer .user-profile-content {
    overflow-y: auto;
    flex: 1;
    padding-right: 6px;
}
`;
if (text.includes('.user-profile-drawer {') && text.indexOf('.user-profile-drawer {') < mainStart) {
  console.log('already has global user-profile-drawer');
  process.exit(0);
}
// ensure snippet not duplicated
if (text.includes('.user-profile-drawer {') && text.indexOf('.user-profile-drawer {') > mainEnd) {
  // remove any versions inside media query, we keep this one
  // but we won't alter now
}
text = text.slice(0, mainEnd) + snippet + text.slice(mainEnd);
fs.writeFileSync(path, text, 'utf8');
console.log('inserted global user-profile-drawer');
