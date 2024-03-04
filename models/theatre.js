
const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const theatreSchema=new Schema({
      theatrename:{
        type:String,
      },
      floor:{
        type:String,
      },
      buildingname:{
        type:String,
      },
      place:{
        type:String,
      },
      city:{
        type:String,
      },

      state:{
        type:String,
      },
      country:{
        type:String,
      },

      seatCapacity:{
        type:Number,
      },

      availableDate:{
        type:[String],
      },

      bookedTicket:{
        type:Object,
      },
});


const Theatre=mongoose.model("Theatre",theatreSchema);
module.exports=Theatre;