const User=require("../models/user.js");

module.exports.renderSignup=(req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
      console.log(req.body);
      let{username,email,password}=req.body.signup;
      const newUser=new User({email,username});
      console.log(newUser);
      const registeredUser=await User.register(newUser,password);
      console.log(registeredUser);
      req.login(registeredUser,(err)=>{
        if(err){
          next(err);
        }
        req.flash("success","welcome to movieticketbooking app!");
        res.redirect("/listings");
      });
  
    }catch(e){
      req.flash("error",e.message);
      res.redirect("/signup");
    }
  
  };

module.exports.renderLogin=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=(req,res)=>{

    req.flash("success","you are successfully logged in!");
    let redirectUrl=res.locals.redirectUrl || "/listings";
     res.redirect(redirectUrl);
    
    };

module.exports.logout=(req,res)=>{
    req.logOut((err)=>{
      if(err){
        next(err);
      }
      req.flash("success","you are logged out!");
      res.redirect("/listings");
    });
};