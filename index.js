import express from "express";
import bodyParser from "body-parser";
import mongoose, { Schema } from "mongoose";
import _ from "lodash";

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
// app.set('view engine',(__dirname, '../ejs'));

// let task = ["buy 1", " buy 2"];

// mongoose.connect("mongodb://localhost:27017/todolistDB");

// const ItemSchema = new mongoose.Schema({
//     name : String
// })

// const Item = new mongoose.model('Items', ItemSchema);

// const item1 = new Item({
//     name : "Sharad"
// })
// const item2 = new Item({
//     name : "Kajal"
// })
// const item3 = new Item({
//     name : "Manish"
// })
// const defaultItems = [item1,item2,item3];

// Item.insertMany(defaultItems)
// .then(function(result){
//     console.log("success");
// })
// .catch(function(error){
//     console.log(error);
// })

// app.get("/",(req,res)=>{
//     res.render("index.ejs",{
//         task : Item,
//     });
// })
// app.post("/",(req,res)=>{
//     let newTask = req.body["newtask"];
//     task.push(newTask);
//     res.redirect("/");
// })



// app.listen(3000,()=>{
//     console.log("server is running on port 3000");
// })
async function run(){
    await mongoose.connect("mongodb+srv://admin-kajal:1234kajal@cluster0.zhfyzum.mongodb.net/todolistDB").then(() => console.log("Database connected!"))
.catch(err => console.log(err));
}
run();

 //Created Schema
const itemsSchema = new mongoose.Schema({
    name: String
});
   
//Created model
const Item = mongoose.model("Item", itemsSchema);

//Creating items
const item1 = new Item({
  name: "Welcome to your todo list."
}); 
 
const item2 = new Item({
  name: "Hit + button to create a new item."
});
 
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
//Storing items into an array
const defaultItems = [item1, item2, item3];
 
//In latest version of mongoose insertMany has stopped accepting callbacks
//instead they use promises(Which Angela has not taught in this course)
//So ".then" & "catch" are part of PROMISES IN JAVASCRIPT.
 
//PROMISES in brief(If something is wrong please correct me):
//In JS, programmers encountered a problem called "callback hell", where syntax of callbacks were cumbersome & often lead to more problems.
//So in effort to make it easy PROMISES were invented.
//to learn more about promise visit : https://javascript.info/promise-basics
//Or https://www.youtube.com/watch?v=novBIqZh4Bk
 
//! this to insert the data
// Item.insertMany(defaultItems)
//   .then(function(){
//     console.log("Successfully saved into our DB.");
//   })
//   .catch(function(err){
//     console.log(err);
//   });


const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
})
 
const List = new mongoose.model("List", listSchema);


app.get("/", function(req, res) {
    Item.find().then(function (myItems){
        if(myItems.length === 0){
            Item.insertMany(defaultItems)
            .then(function(){
            console.log("Successfully saved into our DB.");
            })
            .catch(function(err){
            console.log(err);
            });
            res.redirect("/");
        }
        else{
            res.render("index.ejs", {listTitle: "Today", newListItems: myItems});
        }
      
    });
  });
 
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  })
  if(listName === "Today")
  {
    item.save();

    res.redirect("/");
  }
  else{
    List.findOne({name : listName })
  .then(function(foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  })
  .catch((err)=>{
    console.log(err);
  })
          
  }
 
});

app.post("/delete", function(req,res){
  const checkedItem = req.body.checkbox;
  const listName =req.body.listName;
  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItem).then(()=>{
      console.log("Succesfully removed")
    }).catch((err)=>{
      console.log(err);
    })
  
    res.redirect("/");
  }
  else
  {
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkedItem}}})
    .then(()=>{
      res.redirect("/" +listName);
    })
    .catch((error)=>{
      console.log(error);
    })
  }
  
})


app.get("/:titleName", (req,res)=>{
  const customTitleName = _.capitalize(req.params.titleName);

  List.findOne({name : customTitleName })
  .then(function(foundList){
        
    if(!foundList){
      const list = new List({
        name:customTitleName,
        items:defaultItems
      });
    
      list.save();
      console.log("saved");
      res.redirect("/"+customTitleName);
    }
    else{
      res.render("index.ejs",{listTitle:foundList.name, newListItems:foundList.items});
    }
})
.catch(function(err){
  console.log(err);
});
  
  
})


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
 
// app.get("/about", function(req, res){
//   res.render("about");
// });
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});