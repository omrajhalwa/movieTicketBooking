const Listing=require("./models/listing");
const Review=require("./models/review.js");
const {listingSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");
const {reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
  // console.log(req.path,"..",req.originalUrl);
   if(!req.isAuthenticated()){
       //redirect url have to save
       req.session.redirectUrl=req.originalUrl;
       req.flash("error","you must be logged in to create listing!");
       return res.redirect("/login");
   }

   next();
}


module.exports.saveRedirectUrl=(req,res,next)=>{
   //passport login hone ke badd  req.directUrl ko kahli kar denge thats why
 if(req.session.redirectUrl){
   res.locals.redirectUrl=req.session.redirectUrl;
 }
 next();
};

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id).populate("owner");
      // console.log(res.locals.currUser);
      // console.log(listing.owner);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
      req.flash("error","you are not the owner of listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
};



module.exports.validateListing=(req,res,next)=>{
    
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.validateReview=(req,res,next)=>{
      let {error}=reviewSchema.validate(req.body);
      
      if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        // throw new ExpressError(400,error);
        throw new ExpressError(400,errMsg);
      }else{
        next();
      }
};

module.exports.isReviewAuthor=async(req,res,next)=>{
  let {id,reviewId}=req.params;

  let review=await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser)){
    req.flash("error","you are not the author of review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};