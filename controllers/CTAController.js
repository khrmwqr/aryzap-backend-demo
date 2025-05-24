const CTA = require("../models/CTA");

// Create a new CTA
exports.createCTA = async (req, res) => {
    try {
        const { title, icon, image, buttonName, buttonAction, isLogin } = req.body;

        // Validate required fields
        if (!title || !icon || !image || !buttonName || !buttonAction) {
            return res.status(400).json({
                success: false,
                message: 'All required fields (title, icon, image, buttonName, buttonAction) must be provided',
            });
        }

        // Create a new CTA instance
        const newCTA = new CTA({
            title,
            icon,
            image,
            buttonName,
            buttonAction,
            isLogin: isLogin || false,
        });

        // Save the CTA to the database
        const savedCTA = await newCTA.save();

        res.status(201).json({
            success: true,
            message: 'CTA created successfully',
            data: savedCTA,
        });
    } catch (error) {
        console.error('Error creating CTA:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating CTA',
            error: error.message,
        });
    }
};

// Get all CTAs
exports.getAllCTAs = async (req, res) => {
    try {
        const ctas = await CTA.find();
        res.status(200).json({
            success: true,
            message: 'CTAs retrieved successfully',
            data: ctas,
        });
    } catch (error) {
        console.error('Error fetching CTAs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching CTAs',
            error: error.message,
        });
    }
};

// Get a single CTA by ID
exports.getCTAById = async (req, res) => {
    try {
        const { id } = req.params;
        const cta = await CTA.findById(id);
        if (!cta) {
            return res.status(404).json({
                success: false,
                message: 'CTA not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'CTA retrieved successfully',
            data: cta,
        });
    } catch (error) {
        console.error('Error fetching CTA:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching CTA',
            error: error.message,
        });
    }
};

// Update a CTA by ID
exports.updateCTA = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, icon, image, buttonName, buttonAction, isLogin } = req.body;

        const updatedCTA = await CTA.findByIdAndUpdate(
            id,
            { title, icon, image, buttonName, buttonAction, isLogin },
            { new: true, runValidators: true }
        );
        if (!updatedCTA) {
            return res.status(404).json({
                success: false,
                message: 'CTA not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'CTA updated successfully',
            data: updatedCTA,
        });
    } catch (error) {
        console.error('Error updating CTA:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating CTA',
            error: error.message,
        });
    }
};

// Delete a CTA by ID
exports.deleteCTA = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCTA = await CTA.findByIdAndDelete(id);
        if (!deletedCTA) {
            return res.status(404).json({
                success: false,
                message: 'CTA not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'CTA deleted successfully',
            data: deletedCTA,
        });
    } catch (error) {
        console.error('Error deleting CTA:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting CTA',
            error: error.message,
        });
    }
};