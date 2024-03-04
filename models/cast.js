const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const castSchema=new Schema({

image:{
    type:String,
},

knownAs:{
    type:String,

},

occupation:{
    type:String,
},

born:{
    type:String,
}
,
birthPlace:{
    type:String,
}
,
spouse:{
    type:String,
}
,
children:{
    type:String,
},

about:{
    type:String,
}

});

module.exports=mongoose.model("Cast",castSchema);