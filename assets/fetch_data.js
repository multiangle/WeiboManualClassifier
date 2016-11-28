const mongo = require('mongodb') ;
var MongoClient = mongo.MongoClient ;
var db_uri = 'mongodb://localhost:27017/microblog_part' ;

var data_storage = new Array() ;
var is_fetching = false ;

fetch_batch_data() ;

function fetch_batch_data(filter){
    is_fetching = true ; 
    MongoClient.connect(db_uri, (err,db)=>{
        let collection = db.collection('latest_history') ;
        let res = collection.find().limit(10) ;
        res.toArray((err,docs)=>{
            data_storage = data_storage.concat(docs) ;
            is_fetching = false ;
        })
    })
}

module.exports.fetch_one = function(){
    if (data_storage.length>0){
        let res = data_storage.shift() ;
        if (data_storage.length<2) fetch_batch_data() ;
        return res ;
    }else{
        if (is_fetching) return null ;
        else{
            fetch_batch_data() ;
            return null ;
        }
    }
}