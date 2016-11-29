const util = require('util') ;

electron = require("electron") ;
ipcr = electron.ipcRenderer ;

var fetch_data = require('../assets/fetch_data.js') ;
$("document").ready(function(){

    init() ; // 参数初始化

    ipcr.on('channel-fetch-reply',(event,res)=>{
        console.log(res) ;
        display = buildDisplayInfo(res) ;
        $("#weibo-content").append('<p style="font-size:10px">'+display+'</p>');
    })

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

    $(".cbtn").click((e)=>{
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
    })

    // commit info, and reset info
    $("button#commit").click(()=>{
        if (emotion_selected=="" || category_selected==""){
            alert("Cannot COMMIT!") ;
            return ;
        }
                
        // 摘录信息
        let res = {};
        res.emotion = emotion_selected ;
        res.emotion_id = emotion_id ;
        res.category = category_selected ;

        // 重置
        resetStatus() ;

        // 提交后台
        ipcr.send('channel-commit',res) ;
        var fetch_data = require('../assets/fetch_data.js') ;
        let v = fetch_data.fetch_one() ;
        console.log(v) ;
    });
            
})
        
// hot key
$(document).keydown((e)=>{
    let fmt = 'button#key-' ;
    let types = new Array('q','w','e','r','t') ;
    if (types.indexOf(e.key)>-1) { // 跟emotion有关的快捷键
        $(fmt+e.key).click()
        return ;
    }

    types = new Array('Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','C','V','B') ;
    if (types.indexOf(e.key)>-1) { // 跟category有关的快捷键
        $(fmt+e.key).click()
        return ;
    }

    if (e.key == 'Enter'|| e.key==' ') $('button#commit').click() ;
    console.log(e.key) ;
});

// init function
function init(){
    ipcr.send('channel-fetch') ;// 请求获得数据

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

function buildDisplayInfo(res){
    // user 
    let display = "" ;
    let user_fmt = "<p>名字: %s\t 描述: %d\t 粉丝: %d uid: %d</p>"
    let user = util.format(user_fmt,
                            res.user.name,
                            res.user.description,
                            res.user.fans_num,
                            res.user.uid ) ;

    // content
    let content_fmt = "<p>内容: %s</p>"
    let left_content = res.left_content ;
    let compact = "" ;
    for(let i in left_content) compact += left_content[i] ;
    let content = util.format(content_fmt,compact) ;
    if (res.is_retweeted){
        let left_content = res.retweeted_left_content ;
        let compact = "" ;
        for(let i in left_content) compact += left_content[i] ;
        let ret_fmt = "<p>转发内容: %s</p>"
        content += util.format(ret_fmt, compact); 
    }

    let final = user + content ;

    return final ;
}