const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace authService.getMe() incorrect property accesses
  
  if (file.includes('fleet/page.tsx')) {
    content = content.replace(/user\?\.managedCenter\?\.id/g, 'user?.data?.managedCenter?.id');
    content = content.replace(/user\.managedCenter\.id/g, 'user.data.managedCenter.id');
    changed = true;
  }
  
  if (file.includes('center-profile/page.tsx')) {
    content = content.replace(/user\?\.managedCenter\?\.id/g, 'user?.data?.managedCenter?.id');
    content = content.replace(/user\.managedCenter\.id/g, 'user.data.managedCenter.id');
    changed = true;
  }
  
  if (file.includes('reviews/page.tsx')) {
    content = content.replace(/user\?\.managedCenter\?\.id/g, 'user?.data?.managedCenter?.id');
    content = content.replace(/user\.managedCenter\.id/g, 'user.data.managedCenter.id');
    changed = true;
  }

  if (file.includes('dashboard/page.tsx')) {
    // getCenterById(userRes.data.managedCenter) -> getCenterById(userRes.data.managedCenter.id)
    content = content.replace(/getCenterById\(userRes\.data\.managedCenter\)/g, 'getCenterById(userRes.data.managedCenter.id)');
    changed = true;
  }
  
  if (file.includes('emergencies/page.tsx')) {
    // getCenterById(meRes.data.managedCenter) -> getCenterById(meRes.data.managedCenter.id)
    content = content.replace(/getCenterById\(meRes\.data\.managedCenter\)/g, 'getCenterById(meRes.data.managedCenter.id)');
    changed = true;
  }

  if (file.includes('mechanics/page.tsx')) {
    content = content.replace(/getCenterById\(meRes\.data\.managedCenter\)/g, 'getCenterById(meRes.data.managedCenter.id)');
    content = content.replace(/setCenterId\(meRes\.data\.managedCenter\)/g, 'setCenterId(meRes.data.managedCenter.id)');
    changed = true;
  }
  
  if (file.includes('service-requests/page.tsx')) {
    content = content.replace(/getCenterById\(meRes\.data\.managedCenter\)/g, 'getCenterById(meRes.data.managedCenter.id)');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});

