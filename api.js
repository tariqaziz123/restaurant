var express = require('express');
var app = express();
var port = process.env.PORT || 7800;
var bodParser = require('body-parser');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient
var mongourl = "mongodb+srv://root:mongodb619@cluster0.hctio.mongodb.net/edumato?retryWrites=true&w=majority";
var cors = require('cors');
let db;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/',(req,res) => {
    res.send("<div><a href='http://localhost:7800/location'>Location</a><br/><a href='http://localhost:7800/mealtype'>MealType</a><br/><a href='http://localhost:7800/cuisine'>Cuisine</a><br/><a href='http://localhost:7800/restaurant'>Restaurant</a></div>")
})

//City List
app.get('/location',(req,res) => {
    db.collection('city').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//Meal Type
app.get('/mealtype',(req,res) => {
    db.collection('mealtype').find({}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//Cusine
app.get('/cuisine',(req,res) => {
    db.collection('cuisine').find({}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//Restaurant
app.get('/restaurant',(req,res) => {
    var query = {};
    if(req.query.city && req.query.mealtype){
        query={city:req.query.city,"type.mealtype":req.query.mealtype}
    }
    else if(req.query.city){
        query={city:req.query.city}
    }
    else if(req.query.mealtype){
        query={"type.mealtype":req.query.mealtype}
    }
    db.collection('restaurant').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

app.get('/restaurantDetails/:id',(req,res) => {
    console.log(req.params.id)
    var query = {_id:req.params.id}
    db.collection('restaurant').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
});

////////////////////////Listing Page Api//////////////
app.get('/restaurantlist/:mealtype', (req,res) => {
    var query = {"type.mealtype":req.params.mealtype};
    var sort = {cost:-1}
    if(req.query.city && req.query.sort){
        query={"type.mealtype":req.params.mealtype,"city":req.query.city}
        sort = {cost:Number(req.query.sort)}
    }else if(req.query.cuisine  && req.query.sort){
        query={"type.mealtype":req.params.mealtype,"Cuisine.cuisine":(req.query.cuisine)}
        sort = {cost:Number(req.query.sort)}
    }else if(req.query.lcost && req.query.hcost && req.query.sort){
        query={"type.mealtype":req.params.mealtype,"cost":{$lt:parseInt(req.query.lcost),$gt:parseInt(req.query.hcost)} }
        sort = {cost:Number(req.query.sort)}
    }else if(req.query.city){
        query={"type.mealtype":req.params.mealtype,"city":req.query.city}
    }else if(req.query.cuisine){
        query={"type.mealtype":req.params.mealtype,"Cuisine.cuisine":(req.query.cuisine)}
    }else if(req.query.lcost && req.query.hcost){
        query={"type.mealtype":req.params.mealtype,"cost":{$lt:parseInt(req.query.lcost),$gt:parseInt(req.query.hcost)} }
    }
    db.collection('restaurant').find(query).sort(sort).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
});

//orders
app.get('/orders',(req,res) => {
    db.collection('orders').find({}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
});

//placeorder
app.post('/placeorder',(req,res) => {
    db.collection('orders').insertOne(req.body,(err,result) => {
        if(err){
            throw err
        }else{
            res.send('Data Added')
        }
    })
});


MongoClient.connect(mongoUrl,(err,client) => {
    if(err) console.log(err);
    db = client.db('edumato');
    app.listen(port,(err) => {
        if(err) throw err;
        console.log(`Server is running on port ${port}`)
    })
})
