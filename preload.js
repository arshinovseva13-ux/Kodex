const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('kodexTerm', {
  run: cmd => ipcRenderer.send('term:run', cmd),
  kill: () => ipcRenderer.send('term:kill'),
  on: cb => ipcRenderer.on('term:data', (_, d) => cb(d))
});
