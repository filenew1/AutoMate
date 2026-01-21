declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => void;
      toggleMaximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

export {};