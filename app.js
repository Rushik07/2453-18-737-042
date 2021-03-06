const express=require('express')
const app=express()

const MongoClient=require('mongodb').MongoClient
const url= 'mongodb://127.0.0.1:27017'
const dbName='hospital'
let server=require('./server')
let middleware=require('./middleware')

const bodyParser=require('body-parser')
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
let db
MongoClient.connect(url,{useUnifiedTopology:true} , (err,client)=>{
    if(err) return console.log(err)
    db=client.db(dbName)
    console.log(`Connected MongoDB: ${url}`)
    console.log(`Database: ${dbName}`)
})
app.get('/hospitalDetails', middleware.checkToken , function(req,res){
    console.log("Fetching data from Hospital Collections");
    var data=db.collection('hospitalIn').find().toArray().then(result=>res.json(result));
});
app.get('/ventilatorDetails', middleware.checkToken ,function(req,res){
    console.log("Fetching data from Ventilators Collections ");
    var data=db.collection('ventilatorIn').find().toArray().then(result=>res.json(result));
}
);
app.post('/searchventbystatus', middleware.checkToken ,(req,res)=>{

    console.log(req.body.status)
    var ventilatordetail=db.collection('ventilatorIn').find({"status":req.body.status}).toArray().then(result => res.json(result))

 
})
app.post(`/searchventilatorbyname`,middleware.checkToken ,function(req,res){
    var name=req.query.name;
    console.log(name);
    var ventilatorDetails=db.collection('ventilatorIn').find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});
app.post(`/searchhospital`, middleware.checkToken ,function(req,res){
    var name=req.query.name;
    console.log(name);
    var hospitalDetails=db.collection('hospitalIn').find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});
app.put(`/updateventilator`, middleware.checkToken ,function(req,res){
    var vid={vid:req.body.vid};
    console.log(vid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilatorIn").updateOne(vid,newvalues,function(err,result){
        res.json('one document updated');
        if(err)throw err;
    });
});
app.post(`/addventilatorbyuser`,middleware.checkToken ,function(req,res){
    var hID=req.body.hid;
    var ventilatorID=req.body.vid;
    var status=req.body.status;
    var name=req.body.name;
    var item={
        hid:hID,vid:ventilatorID,status:status,name:name
    };
    db.collection('ventilatorIn').insertOne(item,function(err,result){
        res.json('Item has been inserted');
    });
});
app.delete('/deletevent',middleware.checkToken ,function(req,res){
    console.log("Deleting ventilator details...");
    var d=req.query.vid;
    db.collection('ventilatorIn',function(err,collection){
        var q={vid:d};
    collection.deleteOne(q,function(err,items){
    if (err) throw err;
    console.log("1 ventilator deleted..");   
    res.end("1 ventilator deleted..") ;
    res.end();
        });
    });});
app.listen(3000);