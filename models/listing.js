const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review = require("./review");
const Cast = require("./cast");
const Theatre=require("./theatre");
const listingSchema=new Schema({
title:{
type:String,
require:true,
},

description:{
type:String,

},
language:{
type:String,

},

image:{
  type:String,

},

rating:{
    type:Number,
    min:1,
    max:10,
},

duration:{
  type:String,
},

movieType:{
    type:String,
},

certifiedRating:{
    type:String,
}
,
releaseDate:{
    type:String,
},

reviews:[
    {
        type:Schema.Types.ObjectId,
        ref:"Review",
    }
],

casts:[
    {
        type:Schema.Types.ObjectId,
        ref:"Cast",
    }
],

owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
},


theatres:[
    {
        type:Schema.Types.ObjectId,
        ref:"Theatre",
    }
],

});


const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;