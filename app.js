const express=require("express");
const app=express();
const mongoose=require("mongoose");
let port=8080;
//what type of database you want type folder name below here
const MONGO_URL="mongodb://127.0.0.1:27017/movieTicketBooking";
const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const Cast=require("./models/cast.js");
const path=require("path");
const ejsMate=require("ejs-mate");
const methodOverride=require("method-override");
const ExpressError=require("./utils/ExpressError.js");
const wrapAsync=require("./utils/wrapAsync.js");
const {validateListing,validateReview,isLoggedIn}=require("./middleware.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const users=require("./routes/user.js");
const Theatre = require("./models/theatre.js");



// MONGO CONNECTION START................
main().then(()=>{
  console.log("connected to mongodb");
}).catch((err)=>{
  console.log("error in connection of mongodb",err);
});

async function main(){
  await mongoose.connect(MONGO_URL);
}

// MONGO CONNECTION END....................

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const sessionOptions={
    secret:"hello gf",
    resave:false,
    saveUninitialized:true,
    cookie:{
      expires:Date.now()+7*24*60*60*1000, //millisecond session
      maxAge:7*24*60*60*1000,
      httpOnly:true,
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
//for initialize passport
app.use(passport.session());
//for checking same session for user
passport.use(new LocalStrategy(User.authenticate()));
//for checking authencity
passport.serializeUser(User.serializeUser());
//for storing user
//for removing user
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
res.locals.success=req.flash("success");
res.locals.error=req.flash("error");
res.locals.currUser=req.user;
next();
});


app.get("/",(req,res)=>{
  res.send(" my server in on");
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",users);

app.post("/demo",(req,res)=>{
  console.log(req.body);
})

//show seatlayout.....
app.post("/listings/:id/theatres/:theatreId/seatlayout",isLoggedIn,async(req,res)=>{
      // console.log(req.params);
      // console.log(req.body);
      let bookingDate=req.body;
       let {id,theatreId}=req.params;
       let listing=await Listing.findById(id);
       let theatre=await Theatre.findById(theatreId);
       if (!theatre.bookedTicket) {
        theatre.bookedTicket = {};
          }
        if(theatre.bookedTicket){
        // console.log(1);
        }else{
          theatre.bookedTicket[`${bookingDate.date}`]=[];
        }
       
       
        console.log(bookingDate);
       res.render("theatres/seatlayout.ejs",{listing,theatre,bookingDate});
});
//book seats.......
app.post("/listings/:id/theatres/:theatreId",async(req,res)=>{
        // console.log(req.body);
         let booking=req.body.booking;
        //  console.log(booking.seat)
        let keys=booking.date;
        let val=booking.seat;
        console.log(keys);
         let myBooking={
          [keys]:val,
         }
        //  console.log(req.params);
         let {id,theatreId}=req.params;
        let theatre=await Theatre.findById(theatreId);
          console.log(myBooking);
        console.log(theatre.bookedTicket);
        //  theatre.bookedTicket={...theatre.bookedTicket,...myBooking};
     
        // for (let key in myBooking[keys]) {
        //   theatre.bookedTicket[keys].push(myBooking[keys][key]);
        // }
       
    
      theatre.bookedTicket[keys] = theatre.bookedTicket[keys] || [];
      let arr=[];
      for(let val of myBooking[keys]){
      if(val!=','){arr.push(val)}
      }for(let val of theatre.bookedTicket[keys]){
        if(val!=','){arr.push(val)}
        }
        console.log(arr);
    



        const documentId = theatreId; // Replace with the ID of the document
        const newBookedTicket = {
            [keys]: arr,
            
        };

        for(let key in theatre.bookedTicket){
          if(key!=keys){
            newBookedTicket[key]=theatre.bookedTicket[key];
          }
        }
        
        // Use findOneAndUpdate() to find the document and update the bookedTicket field
        Theatre.findByIdAndUpdate(
            documentId,
            { $set: { bookedTicket: newBookedTicket } },
            { new: true } // Optional parameter to return the modified document
        )
        .then(updatedDocument => {
            if (updatedDocument) {
                console.log('Document updated successfully:', updatedDocument);
            } else {
                console.log('Document not found');
            }
        })
        .catch(error => {
            console.error('Error updating document:', error);
        });




          
      
         
        await theatre.save();
     
         console.log(theatre.bookedTicket);

    res.redirect(`/listings/${id}`);

});


//add threatre get..
app.get("/listings/:id/theatres",async(req,res)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);

    res.render("theatres/newtheatre.ejs",{listing});
});
//create theatre listings
app.post("/listings/:id/theatres",async(req,res)=>{
  let {id}=req.params;
  // console.log(req.body);
  let list=await Listing.findById(id);
  let newtheatre=new Theatre(req.body.listing);
  // console.log(newtheatre);
   list.theatres.push(newtheatre);
  await list.save();
  await newtheatre.save();

    res.redirect("/listings");
});


//show theatre listings......
app.get("/listings/:id/availableTheatre",async(req,res)=>{
let {id}=req.params;
let obj={date:""};
   let listing= await Listing.findById(id).populate("theatres");
         res.render("theatres/showTheatre.ejs",{obj,listing});
});
//give date route........
app.post("/listings/:id/availableTheatre",async(req,res)=>{
  
  let obj=req.body;
   console.log(obj);
  res.locals.chooseDate=obj.date;
  let {id}=req.params;
  let listing= await Listing.findById(id).populate("theatres");
  res.render("theatres/showTheatre.ejs",{obj,listing});

})


//new cast route.......
app.get("/listings/:id/casts",async(req,res)=>{
  
  let {id}=req.params;
  let list=await Listing.findById(id);
  
    res.render("casts/newcast.ejs",{list});
});

//create route for cast...
app.post("/listings/:id/casts",async(req,res)=>{
  console.log(req.body);
  let {id}=req.params;
  let listing=await Listing.findById(id);
  let newCast=new Cast(req.body.cast);
  listing.casts.push(newCast);
   await newCast.save();
   await listing.save();
  res.redirect(`/listings/${id}`);
});

//filter rotue

app.post("/filter",async(req,res)=>{
  let list=req.body.listing;
  
 
  const allListings=await Listing.find({});
     res.render("listings/index.ejs",{allListings,list});
});

//Universal route

app.all("*",(req,res,next)=>{
   next(new ExpressError(404,"page not found"));

});



//custom error middleware....
app.use((err,req,res,next)=>{
let {statusCode=500,message="something went wrong"}=err;
console.log(err);
res.status(statusCode);
res.render("error.ejs",{message});
});




app.listen(port,()=>{
console.log("server is connnected");
});