const Listing = require("../models/listing.js");

module.exports.searchListings = async (req, res) => {
  let { q } = req.query;

  const listings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });

  res.render("listings/index.ejs", {
    allListing: listings,
  });
};

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.newForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "..", filename);
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {
    url: req.file.path,
    filename: req.file.filename,
  };
  await newListing.save();
  req.flash("success", "New listing created");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you are requested for Does not exist");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true },
  );
  console.log(req.file);
  // if new image uploaded
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated Successfully!");
  res.redirect("/listings");
  // res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log("this listing has deleted");
  req.flash("success", " Listing deleted");
  res.redirect("/listings");
};
