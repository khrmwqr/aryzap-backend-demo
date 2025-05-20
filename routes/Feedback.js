const express = require('express');
const FeedbackController = require('../controllers/FeedbackController'); // Adjust the path as necessary

const router = express.Router();

// Create a new Ratings
router.post('/create', FeedbackController.createFeedback);

// Get all Ratingss for a user
router.get('/user/:userId', FeedbackController.getFeedbackByUser);

// Get all Ratingss for a user
router.get('/', FeedbackController.getFeedbacks);



module.exports = router;