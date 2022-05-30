import path from 'path';
import { BrowserWindow, app, ipcMain, shell } from 'electron';

let safe_eval = require('eval');

// 開発モードの場合はホットリロードする
if (process.env.NODE_ENV === 'development') {
	const execPath =
		process.platform === 'win32'
			? '../node_modules/electron/dist/electron.exe'
			: '../node_modules/.bin/electron';

			require('electron-reload')(__dirname, {
				electron: path.resolve(__dirname, execPath),
			});
}

// BrowserWindow インスタンスを作成する関数
const createWindow = () => {
	const mainWindow = new BrowserWindow({
		webPreferences: {
			preload: path.resolve(__dirname, 'preload.js'),
		},
	});

	// レンダラープロセスをロード
	mainWindow.loadFile('dist/index.html');
};

// アプリの起動イベント発火で上の関数を実行
app.whenReady().then(createWindow);

// すべてのウィンドウが閉じられたらアプリを終了する
app.once('window-all-closed', () => app.quit());



ipcMain.on("openExternal", (event, data) => {
	shell.openExternal(data);
});


var functions: ((arg: any) => any)[] = [];

ipcMain.on("createFunction", (event, data) => {
	try {
		let func = safe_eval("module.exports="+data);
		func("TEST");
		let id = functions.push(func);
		event.returnValue = {
			error: null,
			id: id-1
		};
	} catch (error) {
		event.returnValue = {
			error: `${error}`,
			id: -1
		}
		return;
	}
});

ipcMain.on("applyFunction", (event, data) => {
	event.returnValue = functions[data.id](data.arg);
});



