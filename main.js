const electron  = require('electron') ;
const path      = require('path') ;
const os        = require('os') ;
const url       = require('url') ;

const app = electron.app ;
const BrowserWindow = electron.BrowserWindow ; // main window
const Menu = electron.Menu ;        // menu item

let main_win ;

app.on('ready',)


function createWindow(){
    main_win = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#FFEEBF',
        show:false
    })

}
