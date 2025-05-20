const express = require('express');
const router = express.Router();
const membersController = require('../controllers/MembersController'); // Adjust path to your controller

// Member CRUD routes
router.post('/', membersController.createMember); // Create a new member
router.get('/', membersController.getAllMembers); // Get all members
router.get('/:id', membersController.getMemberById); // Get a member by ID
router.put('/:id', membersController.updateMember); // Update member details
router.delete('/:id', membersController.deleteMember); // Delete a member

// Profile management routes
router.post('/:id/profiles', membersController.addProfile); // Add a new profile
router.put('/:id/profiles', membersController.updateProfile); // Update a specific profile
router.delete('/:id/profiles', membersController.deleteProfile); // Delete a specific profile
router.put('/:id/switch-profile', membersController.switchProfile); // Switch default profile

module.exports = router;