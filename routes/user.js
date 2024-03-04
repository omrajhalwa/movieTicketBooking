const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl }=require("../middleware.js");
const userController=require("../controllers/users.js");

router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.signup));


router.route("/login")
.get(userController.renderLogin)
.post(saveRedirectUrl,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true,
}),
userController.login
);
//login se pehle saveRedirecturl ko res.session me store krlenge because passport js req.session ko clear krk refresh krdrega thats we call this middleware

router.get("/logout",userController.logout);

module.exports=router;