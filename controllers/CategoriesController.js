const Categories = require('../models/Categories');

// Get all categories

const getAllCategories = async (req, res) => {
    try {
        const category = await Categories.find({ published: true });
        res.json(category);
    } catch (err) {
        res.json({ message: err });
    }
};

const getAllCategoriesForBackend = async (req, res) => {
    try {
        const category = await Categories.find();
        res.json(category);
    } catch (err) {
        res.json({ message: err });
    }
};

// Get a specific category

const getSpecificCategory = async (req, res) => {

    try {
        const category = await Categories.findById(req.params.categoryId);
        res.json(category);
    } catch (err) {
        res.json({ message: err });
    }
};

// Create a new category

const createCategory = async (req, res) => {

    const category = new Categories({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        appId: req.body.appId,
        published: req.body.published
    });

    try {
        const savedCategory = await category.save();
        res.json(savedCategory);
    } catch (err) {
        res.json({ message: err });
    }
};

// Update a category

const updateCategory = async (req, res) => {

    try {

        const updatedCategory = await Categories.updateOne(
            { _id: req.params.categoryId },
            {
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                    appId: req.body.appId,
                    published: req.body.published
                },
            }
        );

        res.json(updatedCategory);

    } catch (err) {
        res.json({ message: err });
    }
};

// Delete a category

const deleteCategory = async (req, res) => {
    try {
        const removedCategory = await Categories.deleteOne({ _id: req.params.categoryId });
        res.json(removedCategory);
    } catch (err) {
        res.json({ message: err });
    }
};

module.exports = {
    getAllCategories,
    getSpecificCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategoriesForBackend
};