const router = require('express').Router();
const SliderController = require('../controllers/SliderController');

router.get('/', SliderController.getAllSlider);
router.get('/:sliderId', SliderController.getSpecificSlider);
router.post('/', SliderController.createSlider);
router.put('/:sliderId', SliderController.updateSlider);
router.delete('/:sliderId', SliderController.deleteSlider);

module.exports = router;