
const electron = require('electron');
const path = require('path');
const os = require('os');
const url = require('url');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow; // main window
const Menu = electron.Menu;        // menu item

var fetch_data = require('./assets/fetch_data.js') ;

let main_win;

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

function createWindow() {
    main_win = new BrowserWindow({
        width: 1300,
        height: 650,
        backgroundColor: '#FFEEBF',
        show: false
    })

    main_win.loadURL(url.format({
        pathname: path.join(__dirname, 'sections/main.html'),
        protocol: 'file:', // pay attention ':'
        slashes: true
    }))

    // oepn dev tools
    main_win.webContents.openDevTools()

    main_win.on('closed', () => {
        main_win = null;
    })

    main_win.once('ready-to-show', () => {
        main_win.show();
    })

    // console.log(fetch_data.fetch_one()) ;
}


