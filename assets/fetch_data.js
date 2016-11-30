const mongo = require('mongodb') ;
var MongoClient = mongo.MongoClient ;
var db_fmt = "mongodb://localhost:27017/%s" ;
var db_uri = 'mongodb://localhost:27017/microblog_spider' ;

var data_storage = new Array() ;
var is_fetching = false ;



function fetch_batch_data(filter){
    is_fetching = true ; 
    MongoClient.connect(db_uri, (err,db)=>{
        let collection = db.collection('latest_history') ;
        let res = collection.find().sort({'id':-1}).limit(100) ;
        res.toArray((err,docs)=>{
            data_storage = data_storage.concat(docs) ;
            is_fetching = false ;
        })
    })
}

// extract necessary info from json file sent from mongo
function pickUsefulContent(res){
    let valid_res = {}

    // time
    valid_res.created_at        = res.created_at ; 
    valid_res.created_timestamp = res.created_timestamp ;

    // content
    valid_res.left_content      = res.dealed_text.left_content ;
    valid_res.is_retweeted      = res.is_retweeted ;
    if (valid_res.is_retweeted){
        valid_res.retweeted_left_content = 
        res.retweeted_status.dealed_text.left_content ;
    }

    // user
    valid_res.user              = {} ;
    valid_res.user.name         = res.user.name ;
    valid_res.user.fans_num     = res.user.fans_num ;
    valid_res.user.uid          = res.user.uid ;
    valid_res.user.gender       = res.user.gender ;
    valid_res.user.blog_num     = res.user.blog_num ;
    valid_res.user.description  = res.user.description ;

    // weibo id, unique for each weibo
    valid_res.id                = res.id ; 
    valid_res.id_str            = res.id_str ;

    // popularity
    valid_res.attitudes_count   = res.attitudes_count ; 
    valid_res.comments_count    = res.comments_count ;
    valid_res.reposts_count     = res.reposts_count ;

    // other info
    valid_res.source            = res.source ;
    valid_res.pics              = res.pics ;

    return valid_res ;
}

module.exports.fetch_one = function(){
    if (data_storage.length>0){
        let res = data_storage.shift() ;
        let valid_res = pickUsefulContent(res) ;
        if (data_storage.length<2) fetch_batch_data() ;
        // console.log(valid_res) ;
        return valid_res ;
    }else{
        if (is_fetching) return null ;
        else{
            fetch_batch_data() ;
            return null ;
        }
    }
}

module.exports.insert = function(res){
    let uri = 'mongodb://localhost:27017/microblog_classify' ;
    MongoClient.connect(uri, (err,db)=>{
        let collection = db.collection('test') ;
        collection.insert(res) ;
    })
}