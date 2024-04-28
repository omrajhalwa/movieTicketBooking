const express=require("express");
const app=express();
const mongoose=require("mongoose");
let port=8080;
//what type of database you want type folder name below here
const MONGO_CLOUD_URL="mongodb+srv://omraj72470:omraj@cluster0.ozento3.mongodb.net/";
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

const axios=require("axios");
const uniqid=require("uniqid");
const sha256=require("sha256");
const { log } = require("console");
const MongoStore = require('connect-mongo');
//TESTING PURPOSE
const PHONE_PE_HOST_URL="https://api-preprod.phonepe.com/apis/hermes";
const MERCHANT_ID="PGTESTPAYUAT";
const SALT_INDEX=1;
const SALT_KEY="099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";


// MONGO CONNECTION START................
main().then(()=>{
  console.log("connected to mongodb");
}).catch((err)=>{
  console.log("error in connection of mongodb",err);
});

async function main(){
  await mongoose.connect(MONGO_CLOUD_URL);
}

// MONGO CONNECTION END....................

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
  //  store: new MongoStore({ mongooseConnection: mongoose.connection }),
    mongoUrl:MONGO_CLOUD_URL,
    crypto:{
      secret:"hello gf" ,
    },
    touchAfter:24*3600, //in sec session
  
  });
  
  store.on("error",()=>{
    console.log("error in mongo session store",err);
  })

const sessionOptions={
	store,
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


app.get("/users/myorders",isLoggedIn,(req,res)=>{
    console.log(res.locals.currUser);
    const currentDate = new Date(Date.now());
    const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1; // Months are 0-indexed, so we add 1
const day = currentDate.getDate();
const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    res.render("users/showUserOrder.ejs",{formattedDate});
})
//show seatlayout.....
app.post("/listings/:id/theatres/:theatreId/seatlayout",isLoggedIn,async(req,res)=>{
      // console.log(req.params);
   //   console.log(req.body);
      let bookingDate=req.body.data;
      let keys=bookingDate.date;
      let time=req.body.data.time;
       let {id,theatreId}=req.params;
       let listing=await Listing.findById(id);
       let theatre=await Theatre.findById(theatreId);
       
       theatre.bookedTicket = theatre.bookedTicket || {};
      
     
       theatre.bookedTicket[keys]=theatre.bookedTicket[keys] ||{};
       
   
     if(theatre.bookedTicket[keys][time] === undefined) {
         theatre.bookedTicket[keys][time] = [];
     }
       
       
        console.log(theatre.bookedTicket);
       res.render("theatres/seatlayout.ejs",{listing,theatre,bookingDate,time});
});

app.get("/listings/:id/theatres/:theatreId/pay",async(req,res)=>{
  
  
  const {id,theatreId}=req.params;
  const payEndpoint="/pg/v1/pay";
const merchantTransactionId=uniqid();
const userId=123;
const payload={
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": userId,
    "amount": 10000, //in paise
   
    "redirectUrl": `http://localhost:8080/listings/${id}/theatres/${theatreId}/redirect-url/${merchantTransactionId}`,
    "redirectMode": "REDIRECT",
    "mobileNumber": "9999999999",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }
  
  const bufferObj = Buffer.from(JSON.stringify(payload),"utf8");
  const base63EncodedPayload = bufferObj.toString("base64");

  const xVerify=sha256(base63EncodedPayload+payEndpoint + SALT_KEY) + "###" +SALT_INDEX

const options = {
  method: 'post',
  url: `${PHONE_PE_HOST_URL}${payEndpoint}`,
  headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY':xVerify,
				},
data: {
   request:base63EncodedPayload,
   another:{
    "bye":"om"
   }
   
}
};
axios
  .request(options)
      .then(function (response) {
      console.log(response);
      const url=response.data.data.instrumentResponse.redirectInfo.url;
      console.log(url);
      res.redirect(url);
      
  })
  .catch(function (error) {
    console.error(error);
  });

});

app.post("/listings/:id/theatres/:theatreId/redirect-url/:merchantTransactionId",async(req,res)=>{
  const {merchantTransactionId} =req.params;
     console.log('merchantTransactionid',merchantTransactionId);

     if(merchantTransactionId){

      
const xVerify=sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + "###" + SALT_INDEX;
const options = {
  method: 'get',
  url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
  headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-MERCHANT-ID': merchantTransactionId,
        'X-VERIFY':xVerify
				},

};
axios
  .request(options)
      .then(function (response) {
      console.log(response.data);
      res.send(response.data);
  })
  .catch(function (error) {
    console.error(error);
  });
         res.send({merchantTransactionId});
     }else{
      res.send({error:"error"});
     }

});



//book seats.......
app.post("/listings/:id/theatres/:theatreId",async(req,res)=>{
        // console.log(req.body);
         let booking=req.body.booking;
        //  console.log(booking.seat)
       // console.log(res.locals.currUser);
        let userId=res.locals.currUser._id;
         let user= await User.findById(userId);
       //  user.bookedTicket.push(booking);
       //  console.log(user);
        let keys=booking.date;
        let val=booking.seat;
        let time=booking.time;
       // console.log(keys);
         let myBooking={
          [keys]:{
            [time]:val,
          },
         }
        //  console.log(req.params);
         let {id,theatreId}=req.params;
        let theatre=await Theatre.findById(theatreId);
        let theatrename=theatre.theatrename;
        
          // console.log(myBooking);
      //  console.log(theatre.bookedTicket);
        //  theatre.bookedTicket={...theatre.bookedTicket,...myBooking};
     
        // for (let key in myBooking[keys]) {
        //   theatre.bookedTicket[keys].push(myBooking[keys][key]);
        // }
        theatre.bookedTicket = theatre.bookedTicket || {};
        user.bookedTicket=user.bookedTicket || {};
        theatre.bookedTicket[keys]=theatre.bookedTicket[keys] ||{};
        user.bookedTicket[theatrename]=user.bookedTicket[theatrename]||{};
        user.bookedTicket[theatrename][keys] =user.bookedTicket[theatrename][keys] ||{};
    
      if(theatre.bookedTicket[keys][time] === undefined) {
          theatre.bookedTicket[keys][time] = [];
      }if(user.bookedTicket[theatrename][keys][time] === undefined) {
            user.bookedTicket[theatrename][keys][time] = [];
      }
      
      let arr=[];
      for(let val of myBooking[keys][time]){
      if(val!=','){arr.push(val)}
      }for(let val of theatre.bookedTicket[keys][time]){
        if(val!=','){arr.push(val)}
        }
      //  console.log(arr);
    



        const documentId = theatreId; // Replace with the ID of the document
        const newBookedTicket = {
            [keys]:{
              [time]:arr,
            } 
            
        };

        const documentUserId = userId; // Replace with the ID of the document
        const newUserBookedTicket = {
          [theatrename]:{
                [keys]:{
                    [time]:arr,
                 } 
           }
            
        };

        for(let key in theatre.bookedTicket){
          newBookedTicket[key]=newBookedTicket[key]||{};
          for(let timee in theatre.bookedTicket[key]){
            newBookedTicket[key][timee] =  newBookedTicket[key][timee] ||[];
                if(timee!=time||key!=keys){
                  if(newBookedTicket[key][timee] === undefined) {
                    newBookedTicket[key][timee] = [];
                   }
                    newBookedTicket[key][timee]=theatre.bookedTicket[key][timee];
                 }
           }
        }

        for(let theatre in user.bookedTicket){
          newUserBookedTicket[theatre]=newUserBookedTicket[theatre]||{};
          
           for(let key in user.bookedTicket[theatre]){
            newUserBookedTicket[theatre][key]=newUserBookedTicket[theatre][key]||{};
            
               for(let timee in user.bookedTicket[theatre][key]){
                
               newUserBookedTicket[theatre][key][timee]=newUserBookedTicket[theatre][key][timee]|| [];
                   if(time!=timee||key!=keys||theatre!=theatrename){
                      if(newUserBookedTicket[theatre][key][timee] === undefined) {
                        newUserBookedTicket[theatre][key][timee]= [];
                      }
                     newUserBookedTicket[theatre][key][timee]=user.bookedTicket[theatre][key][timee];
                    }
                }
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
              //  console.log('Document updated successfully:', updatedDocument);
            } else {
                console.log('Document not found');
            }
        })
        .catch(error => {
            console.error('Error updating document:', error);
        });
        
        User.findByIdAndUpdate(
          documentUserId,
          { $set: { bookedTicket: newUserBookedTicket } },
          { new: true } // Optional parameter to return the modified document
      )
      .then(updatedDocument => {
          if (updatedDocument) {
            //  console.log('Document updated successfully:', updatedDocument);
          } else {
              console.log('Document not found');
          }
      })
      .catch(error => {
          console.error('Error updating document:', error);
      });



          
      
        //  console.log(user.bookedTicket);
        await theatre.save();
        await user.save();
      //  console.log(newUserBookedTicket);
      //   // console.log(theatre.bookedTicket);
        console.log(user);


    res.redirect(`/listings/${id}/theatres/${theatreId}/pay`);

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
