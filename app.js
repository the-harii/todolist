//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-hari:test123@cluster0.aawkzzw.mongodb.net/todolistDB");

const itemSchema = {
  name:String
};

const Item = new mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Welcome to your todolist"
});

const item2 = new Item({
  name:"Hit the + button to add a new item"
});

const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems =[item1,item2,item3];

const listSchema ={
  name:String,
  items: [itemSchema]
}

const List = new mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems).then(function(){
        console.log("inserted");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }

    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  }).catch(function(err){
    console.log(err);
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
   
  const item = new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    }).catch((error) =>{
      console.log(error);
    })
  }
});

app.post("/delete",function(req, res){
  const checkedItemId = req.body.checkBox;
  const listName= req.body.listName;
  
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(){
      console.log("successfully removed "+checkedItemId);
      res.redirect("/");
    }).catch(error=>{
      console.log(error);
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItemId}}})
    .then(function(err,foundList){
      if(foundList){
        res.redirect("/"+listName);
      }
    }).catch((error)=>{
      console.log(error);
    })
  }

});

app.get("/:customListName",(req, res)=>{
 const customListName = _.capitalize(req.params.customListName);
 List.findOne({name:customListName}).then(function(foundList){
  if(!foundList){
    const list = new List({
      name:customListName,
      items: defaultItems
     });
     res.redirect("/"+customListName);
     list.save();
  }
  else{
    res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
  }
 }).catch(error=>{
    console.log(error);
 });

});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
