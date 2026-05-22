import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist-frontend/index.html'));
  }
  // Hata çözmek için konsolu otomatik açalım
  win.webContents.openDevTools();
}

// Yedeklerin bulunacağı ana klasör değişkenleri
let backupDir;
let eodDir;
let stateFile;

function ensureDirectories() {
  if (!backupDir) {
    backupDir = path.join(app.getPath('documents'), 'Asemm_Yedekler');
    eodDir = path.join(backupDir, 'Gun_Sonlari');

    // Klasörleri oluştur (eğer yoksa)
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    if (!fs.existsSync(eodDir)) fs.mkdirSync(eodDir, { recursive: true });

    // Aktif durum dosyası
    stateFile = path.join(backupDir, 'asemm_data.json');
  }
}

// IPC Handlers
ipcMain.on('save-data', (event, key, data) => {
  try {
    ensureDirectories();
    let currentState = {};
    if (fs.existsSync(stateFile)) {
      currentState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
    currentState[key] = data;
    fs.writeFileSync(stateFile, JSON.stringify(currentState, null, 2));
    event.returnValue = true;
  } catch (error) {
    console.error('Error saving data:', error);
    event.returnValue = false;
  }
});

ipcMain.on('load-data', (event, key) => {
  try {
    ensureDirectories();
    if (fs.existsSync(stateFile)) {
      const currentState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      event.returnValue = currentState[key] !== undefined ? currentState[key] : null;
    } else {
      event.returnValue = null;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    event.returnValue = null;
  }
});

ipcMain.on('save-end-of-day', (event, dateString, reportData) => {
  try {
    ensureDirectories();
    // Windows dosya isimlerinde '/' veya ':' kullanılamaz
    const safeDate = dateString.replace(/[/:]/g, '-').replace(/ /g, '_');
    const filename = path.join(eodDir, `GunSonu_${safeDate}_${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
    event.returnValue = true;
  } catch (error) {
    console.error('Error saving EOD:', error);
    event.returnValue = false;
  }
});

app.whenReady().then(() => {
  ensureDirectories();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
