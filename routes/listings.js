const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const methodOverride = require("method-override");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listing.js");

//validate listing joi
const validateListing = (req, res, next) => {
  // This is for when we try add newlisting in schema , if there are missing these values
  //it will print below error
  //schema.js is used
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// SEARCH ROUTE
router.get("/search", wrapAsync(listingController.searchListings));

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );

//New route
router.get("/new", isLoggedIn, listingController.newForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing),
);

//search route
router.get("/search", async (req, res) => {
  let { q } = req.query;

  const listings = await Listing.find({
    location: { $regex: q, $options: "i" },
  });

  res.render("listings/index.ejs", { allListings: listings });
});

module.exports = router;
