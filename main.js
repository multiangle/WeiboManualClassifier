
const electron = require('electron');
const path = require('path');
const os = require('os');
const url = require('url');
const fs = require('fs') ;

const app = electron.app;
const BrowserWindow = electron.BrowserWindow; // main window
const Menu = electron.Menu;        // menu item
const ipcm = electron.ipcMain ;

var fetchData = require('./assets/fetch_data.js') ;

let main_win;

var dealing_data = null ;

var conf = readConfig() ;
fetchData.fetch_batch_data() ;
//todo 还需要完成fetch_data部分对config的响应和处理.以及setting有输入时的应对
// 还要解决mongo连接数过多的问题.

app.on('ready', createWindow)

app.on('window-all-closed', ()=>{
    if (process.platform !== 'darwin') app.quit();
})

ipcm.on('channel-commit',(event,res)=>{ // 收到commit按钮按下来后发送过来的信息
    dealing_data.category = res.category ;
    dealing_data.emotion = res.emotion ;
    console.log(dealing_data) ;
    if (dealing_data.category!="" && dealing_data.emotion!="")
        fetchData.insert(dealing_data) ;
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

ipcm.on('channel-setting-win',()=>{
    set_win = new BrowserWindow({
        width: 500,
        height: 500,
        show: true,
        parent: main_win
    })
    set_win.loadURL(url.format({
        pathname: path.join(__dirname, 'sections/setting.html'),
        protocol: 'file:',
        slashes: true
    }))
})

function createWindow() {
    main_win = new BrowserWindow({
        width: 1300,
        height: 750,
        backgroundColor: '#FFEEBF',
        show: false,
        icon:'./assets/imgs/huaji.jpg'
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

function readConfig(){
    let cfg_text = fs.readFileSync('./config.json') ;
    let cfg_json = JSON.parse(cfg_text) ;
    if (cfg_json.collection == "") cfg_json.collection = 'latest_history' ;
    return cfg_json ;
}
