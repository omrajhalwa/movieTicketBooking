const Review=require("../models/review");
const Listing=require("../models/listing");

module.exports.createReview=async(req,res,next)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
  //  console.log(req.body);
  //  console.log(newReview);
  newReview.author=req.user._id;
    listing.reviews.push(newReview);
    
  
    await newReview.save();
    await listing.save();
    req.flash("success","New review is created");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview=async(req,res)=>{
    // console.log(req.params);
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    let listing=await Listing.findById(id);
    //console.log(listing);
    req.flash("success","Review is deleted");
    res.redirect(`/listings/${id}`);
  
  };