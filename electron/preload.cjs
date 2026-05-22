const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (key, data) => ipcRenderer.sendSync('save-data', key, data),
  loadData: (key) => ipcRenderer.sendSync('load-data', key),
  saveEndOfDay: (dateString, reportData) => ipcRenderer.sendSync('save-end-of-day', dateString, reportData)
});
