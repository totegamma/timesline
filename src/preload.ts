import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld(
	"preload", {
		ipcRenderer: ipcRenderer
	}
);
