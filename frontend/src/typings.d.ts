export interface Window {
  electronAPI: {
    getLocalStorage: (key: string) => string | null;
    setLocalStorage: (key: string, value: string) => void;
  };
}
