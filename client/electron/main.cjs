const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

let pythonProcess = null;

function startBackend() {
  const serverDir = path.join(app.getAppPath(), "..", "server");
  const python = path.join(serverDir, "venv", "Scripts", "python.exe");

  pythonProcess = spawn(python, ["-m", "uvicorn", "main:app", "--port", "8000"], {
    cwd: serverDir,
    windowsHide: true,
  });
}

function waitForBackend() {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const req = http.get("http://127.0.0.1:8000", () => resolve());
      req.on("error", () => {
        if (++attempts < 30) setTimeout(check, 500);
        else resolve();
      });
      req.end();
    };
    check();
  });
}

async function createWindow() {
  await waitForBackend();

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Geo-News Command Center",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (pythonProcess) pythonProcess.kill();
  app.quit();
});
