var express = require('express');
var app = express();
var port = process.env.PORT || 7800;
var bodParser = require('body-parser');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient
var mongourl = "mongodb+srv://root:mongodb619@cluster0.hctio.mongodb.net/edumato?retryWrites=true&w=majority";
var cors = require('cors');
var db;

app.use(cors());

app.use(bodParser.urlencoded({extended:true}));
app.use(bodParser.json())

app.get('/health',(req,res) => {
    res.send("Api is working")
});

app.get('/',(req,res) => {
    res.send(`<a href="http://localhost:7800/location" target="_blank">City</a> <br/> <a href="http://localhost:7800/mealtype" target="_blank">MealType</a> <br/> <a href="http://localhost:7800/cuisine" target="_blank">Cuisine</a> <br/> <a href="http://localhost:7800/restaurants" target="_blank">Restaurants</a> <br/> <a href="http://localhost:7800/orders" target="_blank">Orders</a>`)
})

//List of city
app.get('/location',(req,res) => {
    db.collection('city').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//mealtype
app.get('/mealtype',(req,res) => {
    db.collection('mealtype').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//cusine
app.get('/cuisine',(req,res) => {
    db.collection('cuisine').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//restaurents
app.get('/restaurants',(req,res) => {
    var condition = {};
    if(req.query.city && req.query.mealtype){
        condition = {city:req.query.city,"type.mealtype":req.query.mealtype}
    }
    else if(req.query.city){
        condition={city:req.query.city}
    } else if(req.query.mealtype){
        condition={"type.mealtype":req.query.mealtype}
    }
    else{
        condition={}
    }
    db.collection('restaurant').find(condition).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

//RestaurentDetai+
app.get('/restaurantdetails/:id',(req,res) => {
    var query = {_id:req.params.id}
    db.collection('restaurant').find(query).toArray((err,result) => {
        res.send(result)
    })
})

//RestaurentList
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
//PlaceOrder
app.post('/placeorder',(req,res) => {
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('posted')
    })
})

//order
app.get('/orders',(req,res) => {
    db.collection('orders').find({}).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})

///Not Require in project
//Delete Orders
app.delete('/deleteorders',(req,res) => {
    db.collection('orders').remove({_id:req.body.id},(err,result) => {
        if(err) throw err;
        res.send('data deleted')
    })
})

//Update orders
app.put('/updateorders',(req,res) => {
    db.collection('orders').update({_id:req.body._id},
        {
            $set:{
                name:req.body.name,
                address:req.body.address
            }
        },(err,result) => {
            if(err) throw err;
            res.send('data updated')
        })
})

MongoClient.connect(mongourl,(err,connection) => {
    if(err) throw err;
    db = connection.db('edumato');
    app.listen(port,(err) => {
        if(err) throw err;
        console.log(`Server is running on port ${port}`)
    })
})
