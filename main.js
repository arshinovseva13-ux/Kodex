const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
let child, cwd = process.env.HOME || process.env.USERPROFILE || process.cwd();

app.whenReady().then(() => {
  const w = new BrowserWindow({
    width: 1280, height: 800, backgroundColor: '#12151c', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  w.webContents.session.setPermissionRequestHandler((_, __, cb) => cb(true));
  w.loadFile('index.html');
});

ipcMain.on('term:run', (e, cmd) => {
  const send = d => e.sender.send('term:data', d.toString());
  const cd = cmd.match(/^cd\s*(.*)$/);
  if (cd) {
    const dir = path.resolve(cwd, cd[1].replace(/^~/, process.env.HOME || '') || '.');
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) cwd = dir;
    return send(cwd + '\n');
  }
  child?.kill();
  child = spawn(cmd, { shell: true, cwd });
  child.stdout.on('data', send);
  child.stderr.on('data', send);
  child.on('close', c => send(`[exit ${c}]\n`));
});
ipcMain.on('term:kill', () => child?.kill());
app.on('window-all-closed', () => app.quit());
