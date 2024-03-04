const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const User = require("./user");

const reviewSchema= new Schema({
    comment:String,
    likes: {
        type: Number,
        default: 0 // Default value for likes is 0
    },
    rating:{
        type:Number,
        min:1,
        max:5,
    },

    createdAt:{
        type:Date,
        default:Date.now(),
    },

    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});

module.exports=mongoose.model("Review",reviewSchema);