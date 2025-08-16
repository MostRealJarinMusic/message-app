import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  getLocalStorage: (key: string) => {
    return window.localStorage.getItem(key);
  },
  setLocalStorage: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
});
