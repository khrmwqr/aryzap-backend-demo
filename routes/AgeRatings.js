const router = require('express').Router();
const AgeRatingsController = require('../controllers/AgeRatingsController');

router.get('/', AgeRatingsController.getAllAgeRatings);
router.get('/:ageId', AgeRatingsController.getSpecificAgeRating);
router.post('/', AgeRatingsController.createAgeRating);
router.put('/:ageId', AgeRatingsController.updateAgeRating);
router.delete('/:ageId', AgeRatingsController.deleteAgeRating);

module.exports = router;