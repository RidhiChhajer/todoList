const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const app = express();
let ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ridhichhajer11:jJyyJVVdX2yXTkd5@todo.m0y7zs7.mongodb.net/toDoListDB");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [1]
    }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Work"
});
const item2 = new Item({
    name: "Personal"
});
const item3 = new Item({
    name: "Family"
});

const defaultItems = [item1, item2, item3];



app.get('/', function (req, res) {
    Item.find({})
        .then((foundItems) => {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then((err) => {
                        console.log("successfully added!");
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                res.redirect("/");
            }
            res.render("list", { listTitle: "Today", list: foundItems });
        })
        .catch((err) => {
            console.log(err);
        });
});
app.post("/", function (req, res) {
    const itemName = req.body.task1;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName==="Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then((foundList)=> {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
    
});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listTitle;
    if(listName==="Today") {
        Item.findByIdAndRemove(checkedItemId).then((foundItem)=>{Item.deleteOne({_id: checkedItemId}); res.redirect("/");}).catch((err) => { console.log(err) });

    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then((foundList)=>{res.redirect("/" + listName);})
            .catch((err)=>{console.log(err);});
            
    }
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});
const List = mongoose.model("List", listSchema);
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({ name: customListName })
        .then((foundList) => {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", { listTitle: foundList.name, list: foundList.items });
            }
        })
        .catch((err) => { console.log(err) });
});

app.get("/about", function (req, res) {
    res.render("about");
});
app.listen(4000, function (req, res) {
    console.log('Server running on port 4000')
});
