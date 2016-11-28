electron = require("electron") ;
ipcr = electron.ipcRenderer ;

$("document").ready(function(){

    init() ; // 参数初始化

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
    })

    // commit info, and reset info
    $("button#commit").click(()=>{
        if (emotion_id == -1){
            alert("Cannot COMMIT!") ;
            return ;
        }
                
        // 摘录信息
        let res = {};
        res.emotion = emotion_selected ;
        res.id = emotion_id ;

        // 重置
        emotion_selected = "" ;
        emotion_id = -1 ;
        btns = $('.ebtn').get() ;
        for(let i in btns){
            $(btns[i]).removeClass('btn-primary').addClass('btn-default') ;
        }

        // 提交后台
        ipcr.send('channel-commit',res) ;
        console.log(res) ;
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

    if (e.key == 'Enter'|| e.key==' ') $('button#commit').click() ;
    console.log(e.key) ;
});

function init(){
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
    console.log(emotions) ;

    category_selected = "" ;
    categorys = new Array() ;   // 分类列表
    category_num = 0 ;
    let cbtns = $(".cbtn").get() ;
    for(let i in cbtns){
        let btn = $(cbtns[i]) ;
        let btn_text = btn.text() ;

        categorys.push(btn.text()) ;
    }
}