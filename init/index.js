const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const User=require("../models/user.js");
const Cast=require("../models/cast.js");
const MONGO_URL="mongodb://127.0.0.1:27017/movieTicketBooking";


main().then(()=>{
    console.log("connected to mongodb");
}).catch((err)=>{
  console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    await Review.deleteMany({});
    await Cast.deleteMany({});
    await User.deleteMany({});
   // await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();