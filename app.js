const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(path.join(__dirname, "/date.js"));
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
// let newItems = ["buy milk", "sleep tight", "read more"];
// let workItems = ["do work"];
mongoose.connect("mongodb://localhost:27017/toDoListDB");
const itemSchema = {
    name: String
};
const listSchema = {
    name: String,
    items: [itemSchema]
}
app.listen(3000, function() {
    console.log("Server running at port 3000");
})
/*default items*/
const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);
const item1 = new Item({
    name: "Welcome to To-Do List"
});
const item2 = new Item({
    name: "Add new tasks by clicking + icon"
});
const item3 = new Item({
    name: "hit Checkbox to delete it"
});
const defaultItems = [item1, item2, item3];
/**************************/
app.get("/", function(req, res) {
    const day = date.getDay();
    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (!err) console.log("inserted default items");
                else console.log(err);
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newItems: foundItems
            })
        }
    });
});
app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({
        name: customListName
    }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                //create new list
                const customList = new List({
                    name: customListName,
                    items: defaultItems
                });
                customList.save();
                res.redirect("/" + customListName);
            } else {
                //list exist so display
                res.render("list", {
                    listTitle: customListName,
                    newItems: foundList.items
                })
            }
        }
    });
});
//dont add empty list items
app.post("/", function(req, res) {
    let newItem = req.body.newItem;
    const itemX = new Item({
        name: newItem
    });
    if (newItem !== "") {
        if (req.body.submit === "Today") {
            //add to items collection
            itemX.save();
            res.redirect("/");
        } else {
            //add to list.items
            const listName = req.body.submit;
            List.findOne({
                name: listName
            }, (err, foundList) => {
                foundList.items.push(itemX); //this is new **********************************
                foundList.save();
                res.redirect("/" + listName);
            });
        }
    } else {
        res.redirect("/" + req.body.submit);
    }
})
app.post("/delete", (req, res) => {
    // console.log(req.body);
    const deleteItemID = req.body.check;
    const listName = req.body.listName;
    if (listName === "Today") {
        //delete from default list
        Item.findByIdAndRemove(deleteItemID, (err) => {
            if (!err) console.log("deleted checked item");
            res.redirect("/");
        });
    } else {
        //find the list by its name and delete item there
        List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: deleteItemID}}}, (err, foundList)=>{
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
});