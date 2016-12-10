const util = require('util') ;
const electron = require("electron") ;

const ipcr = electron.ipcRenderer ;
const BrowserWindow = electron.BrowserWindow ;

var fetch_data = require('../assets/fetch_data.js') ;
var conf = {'single_class':true} ;
$("document").ready(function(){

    // 初始化
    init() ; 

    // 在获取到数据以后的行为(用于初始化)
    ipcr.on('channel-fetch-reply',(event,res)=>{
        console.log(res) ;
        if (res!=null) setDisplay(res) ;
    })

    // 在提交以后从后台获取到新数据以后的行为
    ipcr.on('channel-commit-reply',(event,res)=>{
        setDisplay(res) ;
        // 重置
        resetStatus() ;
    })

    // 获取到setting以后的行为
    ipcr.on('channel-setting-broadcast',(event,res)=>{
        conf = res ;
    })
    ipcr.on('channel-config-ret',(event,res)=>{
        conf = res ;
    })


    // emotion 按钮按下以后的行为
    $(".ebtn").click((e)=>{
        let btn = $(e.target) ;
                
        let btns = $(".ebtn").get() ;
        for(let i in btns){
            $(btns[i]).removeClass('btn-primary').addClass('btn-default') ;
        }
        btn.removeClass('btn-default');
        btn.addClass('btn-primary') ;
        emotion_selected = btn.text() ;
        emotion_id = emotions.indexOf(emotion_selected) ;
        console.log(emotion_selected) ;
    });

    // category 按钮按下以后的行为
    $(".cbtn").click((e)=>{
        if (conf.single_class){
            let btn = $(e.target) ;
            let btns = $(".cbtn").get() ;
            for(let i in btns){
                $(btns[i]).removeClass('btn-primary').addClass('btn-default') ;
            }
            btn.removeClass('btn-default');
            btn.addClass('btn-primary') ;
            let btn_text = btn.text() ;
            category_selected = btn_text.substring(0,btn_text.length-1) ;
            console.log(category_selected) ;
        }else{
            let btn = $(e.target) ;
            if (btn.attr("class").indexOf('btn-default')>=0){
                btn.removeClass('btn-default').addClass('btn-primary') ;
            }else{
                btn.removeClass('btn-primary').addClass('btn-default') ;
            }
        }
        
    })

    // commit info, and reset info
    $("button#commit").click(()=>{
        let btns = $(".cbtn").get() ;
        category_selected = new Array() ;
        for(let i in btns){
            let btn = $(btns[i]) ;
            if (btn.attr("class").indexOf("btn-primary")>=0){
                let btn_text = btn.text() ;
                category_selected.push(btn_text.substring(0,btn_text.length-1)) ;
            }
        }
        // if (emotion_selected=="" || category_selected==""){
        //     alert("Cannot COMMIT!") ;
        //     return ;
        // }
                
        // 摘录信息
        let res = {};
        res.emotion = emotion_selected ;
        res.emotion_id = emotion_id ;
        res.category = category_selected ;

        // 提交后台
        ipcr.send('channel-commit',res) ;
    });

    // setting 按下以后的行为
    $("button#setting").click(()=>{
        ipcr.send("channel-setting-win") ;
    });
            
})
        
// hot key， 快捷键设置
$(document).keydown((e)=>{
    let fmt = 'button#key-' ;
    let types = new Array('q','w','e','r','t') ;
    if (types.indexOf(e.key)>-1) { // 跟emotion有关的快捷键
        $(fmt+e.key).click()
        return ;
    }
    types = new Array('Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','C','V','B','N','M') ;
    if (types.indexOf(e.key)>-1) { // 跟category有关的快捷键
        $(fmt+e.key).click()
        return ;
    }
    if (e.key==';'){ // ; 
        $(fmt+'LR').click() ;
        return ;
    }

    if (e.key == 'Enter'|| e.key==' ') $('button#commit').click() ;
    console.log(e.key) ;
});

// init function
function init(){
    ipcr.send('channel-fetch') ;// 请求获得数据
    ipcr.send('channel-fetch-config') ; //请求获得conf

    emotion_selected = "" ;     // btn-group选中的情绪
    emotion_id = -1 ;
    emotions = new Array() ;    // 情绪列表
    emotion_num = 0 ;           // 情绪种类数目
    let ebtns = $(".ebtn").get() ;
    for(let i in ebtns){
        let btn = $(ebtns[i]) ;
        emotions.push(btn.text()) ;
        emotion_num++ ;
    }

    category_selected = "" ;
    categorys = new Array() ;   // 分类列表
    category_num = 0 ;
    let cbtns = $(".cbtn").get() ;
    for(let i in cbtns){
        let btn = $(cbtns[i]) ;
        let btn_text = btn.text() ;
        btn_text = btn_text.substring(0,btn_text.length-1) ;
        categorys.push(btn_text) ;
        category_num++ ;
    }
}

// reset status
function resetStatus(){
    emotion_selected = "" ;
    emotion_id = -1 ;
    let btns = $('.ebtn').get() ;
    for(let i in btns){
        $(btns[i]).removeClass('btn-primary').addClass('btn-default') ;
    }
    category_selected = "" ;
    btns = $('.cbtn').get() ;
    for(let i in btns){
        $(btns[i]).removeClass('btn-primary').addClass('btn-default') ;
    }
}

// 构建用于显示的信息
function buildDisplayInfo(res){
    // user 
    let display = "" ;
    let user_fmt = "<p style=\"font-size:20px\">名字: %s\t 描述: %d\t 粉丝: %d uid: %d</p>"
    let user = util.format(user_fmt,
                            res.user.name,
                            res.user.description,
                            res.user.fans_num,
                            res.user.uid ) ;

    // content
    let content_fmt = "<p style=\"font-size:20px\">内容: %s</p>"
    let left_content = res.left_content ;
    let compact = "" ;
    for(let i in left_content) compact += left_content[i] ;
    let content = util.format(content_fmt,compact) ;
    if (res.is_retweeted){
        let left_content = res.retweeted_left_content ;
        let compact = "" ;
        for(let i in left_content) compact += left_content[i] ;
        let ret_fmt = "<p style=\"font-size:20px\">转发内容: %s</p>"
        content += util.format(ret_fmt, compact); 
    }

    let pics_img = ""
    let pic_fmt = "<img src=\"%s\">" ;
    if (res.pics){
        for(let i in res.pics){
            let tmp = util.format(pic_fmt,res.pics[i].url) ;
            pics_img += tmp ;
        }
    }
    
    let tm_fmt = "<p style=\"font-size:20px\">时间: %s</p>"
    let tm = util.format(tm_fmt,res.created_at) ;

    let final = user + tm + content + pics_img;

    return final ;
}

function setDisplay(res){
    display = buildDisplayInfo(res) ;
    $("#weibo-content").html('<div>'+display+'</div>');
}