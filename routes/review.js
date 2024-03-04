const express=require("express");
const router=express.Router({mergeParams:true});

const wrapAsync=require("../utils/wrapAsync.js");
const reviewController=require("../controllers/reviews.js");
const {isLoggedIn, isOwner,validateReview,isReviewAuthor}=require("../middleware.js");



router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));


router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview));

module.exports=router;