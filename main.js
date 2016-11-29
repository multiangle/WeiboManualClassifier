
const electron = require('electron');
const path = require('path');
const os = require('os');
const url = require('url');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow; // main window
const Menu = electron.Menu;        // menu item
const ipcm = electron.ipcMain ;

var fetchData = require('./assets/fetch_data.js') ;

let main_win;

var dealing_data = null ;

app.on('ready', createWindow)

app.on('window-all-closed', ()=>{
    if (process.platform !== 'darwin') app.quit();
})

ipcm.on('channel-commit',(event,res)=>{ // 收到commit按钮按下来后发送过来的信息
    dealing_data.category = res.category ;
    dealing_data.emotion = res.emotion ;
    console.log(dealing_data) ;
    let new_res = fetchData.fetch_one() ; 
    dealing_data = new_res ;
    event.sender.send('channel-commit-reply',new_res) ;
})

ipcm.on('channel-fetch',(event)=>{      // 收到获取数据请求并返回。
    console.log('debug from ipcm: ready to fetch data') ;
    let res = fetchData.fetch_one() ;
    dealing_data = res ;
    event.sender.send('channel-fetch-reply',res) ;
})

function createWindow() {
    main_win = new BrowserWindow({
        width: 1300,
        height: 750,
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


