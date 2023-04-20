const express = require('express');
const { Spot, Review, SpotImage, User, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth.js');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const validateNewReview = [
    check('review')
      .exists({ checkFalsy: true })
      .withMessage('Review text is required'),
    check('stars')
      .exists({ checkFalsy: true })
      .isInt({ min: 1, max: 5 })
      .withMessage('Stars must be an integer from 1 to 5'),
      handleValidationErrors
];


const validateNewSpot = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Country is required'),
    check('lat')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage('Latitude is not valid'),
    check('lng')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage('Longitude is not valid'),
    check('name')
      .exists({ checkFalsy: true })
      .isLength({ max: 50 })
      .withMessage('Name must be less than 50 characters'),
    check('description')
      .exists({ checkFalsy: true })
      .withMessage('Description is required'),
    check('price')
      .exists({ checkFalsy: true })
      .withMessage('Price per day is required'),
    handleValidationErrors
  ];

//Get all Reviews by a Spot's ID
router.get('/:spotId/reviews', async (req, res) => {

    const reviews = await Review.findAll({
        where: {
            spotId: req.params.spotId
        },
        include: [
            {
                model: ReviewImage
            },
            {
                model: User
            }
        ]
    });

    const spot = await Spot.findByPk(req.params.spotId);

    if(!spot) {
        res.statusCode = 404;
        res.json({"message": "Spot couldn't be found"})
    }

    let reviewList = [];

    reviews.forEach(review => {
        reviewList.push(review.toJSON())
    });

    reviewList.forEach(review => {
        review.ReviewImages.forEach(image => {
            delete image.reviewId;
            delete image.createdAt;
            delete image.updatedAt;
        });
        delete review.User.username;
    });


    res.json({"Reviews": reviewList})
});




//get details of a spot from an ID
router.get('/:spotId', async (req, res) =>{

    const spot = await Spot.findByPk(req.params.spotId, {
        include: [
            {model: Review},
            {model: SpotImage},
            {model: User, as: "Owner"}
        ]
    });

    if (!spot) {
        res.statusCode = 404;
        res.json({message: "Spot couldn't be found"})
    }

    let normalizedSpot = spot.toJSON();

    let sum = 0;
        normalizedSpot.Reviews.forEach(review => {
            sum += review.stars
        })
        normalizedSpot.avgRating = sum / normalizedSpot.Reviews.length
        normalizedSpot.numReviews = normalizedSpot.Reviews.length
        delete normalizedSpot.Reviews


        normalizedSpot.SpotImages.forEach(image => {
            delete image.spotId
            delete image.createdAt
            delete image.updatedAt
        });

        delete normalizedSpot.Owner.username



    res.json(normalizedSpot)

});


//get all spots owned by the current user  req.user.id
router.get('/current', requireAuth, async (req, res) => {

    const spots = await Spot.findAll({
        where: {
          ownerId: req.user.id
        },
        include: [
        { model: Review },
        { model: SpotImage }
    ]
    });

    let spotList = []

    spots.forEach(spot => {
        spotList.push(spot.toJSON())
    })

    spotList.forEach(spot => {
        let sum = 0;
        spot.Reviews.forEach(review => {
            sum += review.stars
        })
        spot.avgRating = sum / spot.Reviews.length

        delete spot.Reviews
    })


    spotList.forEach(spot => {
        spot.SpotImages.forEach(image => {
            if (image.preview === true) {
                spot.previewImage = image.url
            }
        })
        if (!spot.previewImage) {
            spot.previewImage = 'No image found'
        }
        delete spot.SpotImages
    })


    res.json(spotList)

})

//get all spots and include preview images and average ratings
router.get('', async (req, res) => {

    const spots = await Spot.findAll({
        include: [
        { model: Review },
        { model: SpotImage }
    ]
    });

    let spotList = []

    spots.forEach(spot => {
        spotList.push(spot.toJSON())
    })

    spotList.forEach(spot => {
        let sum = 0;
        spot.Reviews.forEach(review => {
            sum += review.stars
        })
        spot.avgRating = sum / spot.Reviews.length

        delete spot.Reviews
    })


    spotList.forEach(spot => {
        spot.SpotImages.forEach(image => {
            if (image.preview === true) {
                spot.previewImage = image.url
            }
        })
        if (!spot.previewImage) {
            spot.previewImage = 'No image found'
        }
        delete spot.SpotImages
    })

    console.log('req.user.....',req.user)
    res.json(spotList)
});


//Add an image to a spot based on the spots ID
router.post('/:spotId/images', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    const {url, preview} = req.body;
    const {user} = req;

    let normalizedUser = user.toJSON();

    if (!spot) {
        res.statusCode = 404;
        res.json({message: "Spot couldn't be found"})
    };
    if (spot.ownerId !== normalizedUser.id) {
        res.statusCode = 403;
        res.json({message: "Forbidden"})
    };
    const newSpotImage = await SpotImage.create({
        spotId: spot.id,
        url: url,
        preview: preview
    });

    newSpotImageNormalized = newSpotImage.toJSON();

    delete newSpotImageNormalized.spotId;
    delete newSpotImageNormalized.updatedAt;
    delete newSpotImageNormalized.createdAt;

    res.json(newSpotImageNormalized)
});

//Create a Review for a Spot based on the Spot's ID
router.post('/:spotId/reviews', requireAuth, validateNewReview, async (req, res) => {

    const spotId = req.params.spotId
    const review = await Review.build(req.body)
    const spot = await Spot.findByPk(spotId)
    const existingReview = await Review.findAll({
        where: {
            userId: req.user.id,
            spotId: spotId
        }
    });
    if(existingReview) {
        res.status(500).json({"message": "User already has a review for this spot"})
    }
    if (!spot) {
        res.status(404).json({"message":"Spot couldn't be found"});
    }

    review.spotId = spotId;
    review.userId = req.user.id;

    await review.save();

    res.status(201).json(review);
})


//Create a spot
router.post('', requireAuth, validateNewSpot, async (req, res) => {
    const newSpot = await Spot.build(req.body)

    newSpot.ownerId = req.user.id

    await newSpot.save()

    res.json(newSpot)
});


//Edit a spot
router.put('/:spotId', requireAuth, validateNewSpot, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    const {address, city, state, country, lat, lng, name, description, price} = req.body;
    const {user} = req;

    let normalizedUser = user.toJSON();

    if (!spot) {
        res.statusCode = 404;
        res.json({message: "Spot couldn't be found"})
    };
    if (spot.ownerId !== normalizedUser.id) {
        res.statusCode = 403;
        res.json({message: "Forbidden"})
    };

    spot.address = address,
    spot.city = city,
    spot.state = state,
    spot.country = country,
    spot.lat = lat,
    spot.lng = lng,
    spot.name = name,
    spot.description = description,
    spot.price = price

    res.json(spot);

});

//Delete a spot
router.delete('/:spotId', requireAuth, async (req, res) => {
    const spot = await Spot.findByPk(req.params.spotId);

    const {user} = req;

    let normalizedUser = user.toJSON();

    if (!spot) {
        res.statusCode = 404;
        res.json({message: "Spot couldn't be found"})
    };
    if (spot.ownerId !== normalizedUser.id) {
        res.statusCode = 403;
        res.json({message: "Forbidden"})
    };

    spot.destroy();
    res.json({message: "Successfully deleted"});
})










module.exports = router;
