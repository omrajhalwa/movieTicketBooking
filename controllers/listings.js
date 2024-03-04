const Listing=require("../models/listing");


module.exports.index=async(req,res,next)=>{
  
    const allListings=await Listing.find({});
    let list={language:""};
      res.render("listings/index.ejs",{allListings,list});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res,next)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate({
        path:"reviews",populate:{
            path:"author"
        },
    }).populate("owner").populate("casts");
      
    if(!listing){
     res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async(req,res,next)=>{
    //console.log(req.body);
   const newListing=new Listing(req.body.listing);
   newListing.owner=req.user._id;
   await newListing.save();
   req.flash("success","New listing is created");
   res.redirect("/listings");
  
  };

module.exports.renderEditForm=async(req,res,next)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);

    if(!listing){
        req.flash("error","listing you requested for data not found");
     res.redirect("/listings");
    }

res.render("listings/edit.ejs",{listing});
};

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
 
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","New listing is updated!");
    res.redirect(`/listings/${id}`);
 };

 module.exports.destroyListing=async(req,res,next)=>{
    let {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
   // console.log(deleteListing);
   req.flash("success"," listing is deleted");
    res.redirect("/listings");
 };