const express = require('express');
const RatingsController = require('../controllers/RatingsController'); // Adjust the path as necessary

const router = express.Router();

// Create a new Ratings
router.post('/create', RatingsController.createRatings);

// Create or Delete a new or existing Ratings series
// router.post('/cda', RatingsController.toggleRatings);

// Get all Ratingss for a user
router.get('/user/:userId', RatingsController.getRatingsByUser);


// Get all Ratingss for a user series based
router.get('/user/:userId/:seriesId', RatingsController.getRatingsByUserSeriesBased);

// Get a specific Ratings by ID
// router.get('/:id', RatingsController.getRatingsById);

// Update a Ratings
// router.put('/:id', RatingsController.updateRatings);

// Delete a Ratings
// router.delete('/:id', RatingsController.deleteRatings);

module.exports = router;