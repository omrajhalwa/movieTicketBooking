const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");

const listingController=require("../controllers/listings.js");

const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");


router.route("/")
.get(isLoggedIn,wrapAsync(listingController.index))
.post(validateListing,wrapAsync(listingController.createListing));


router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
 .get(wrapAsync(listingController.showListing))
 .put(isLoggedIn,isOwner,validateListing,listingController.updateListing)
 .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));



router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

 module.exports=router;