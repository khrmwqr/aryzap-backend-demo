const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Members = require('../models/Members'); // Adjust path to your Members model

// Create a new member with an initial profile
const createMember = async (req, res) => {
    try {
        const { uid, authProvider, email, password, plan, device, phoneNumber, country, city, profile, gender, firstName, lastName, profilePicture, genresPreference, ageGroup } = req.body;

        // Validate required fields
        if (!email || !authProvider) {
            return res.status(400).json({ message: 'Email and authProvider are required' });
        }

        // Hash password if provided
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create initial profile if provided
        const profiles = profile ? [{
            profileName: profile.profileName,
            firstName: profile.firstName || null,
            lastName: profile.lastName || null,
            profilePicture: profile.profilePicture || null,
            gender: profile.gender || "null",
            ageGroup: profile.ageGroup || "null",
            genresPreference: profile.genresPreference || [],
            isKidsProfile: profile.isKidsProfile || false
        }] : [];

        const member = new Members({
            uid: uid || null,
            authProvider,
            email,
            password: hashedPassword,
            plan: plan || 'free',
            device: device || null,
            phoneNumber: phoneNumber || null,
            country: country || null,
            city: city || null,
            profiles,
            firstName: firstName || null,
            lastName: lastName || null,
            profilePicture: profilePicture || null,
            gender: gender || "null",
            ageGroup: ageGroup || "null",
            genresPreference: genresPreference || [],
            defaultProfile: profile ? profile.profileName : null
        });

        await member.save();
        res.status(201).json({ message: 'Member created successfully', member });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or UID already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all members
const getAllMembers = async (req, res) => {
    try {
        const members = await Members.find().select('-password'); // Exclude password
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single member by ID
const getMemberById = async (req, res) => {
    try {
        const member = await Members.findById(req.params.id).select('-password');
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update member details (excluding profiles)
const updateMember = async (req, res) => {
    try {
        const { authProvider, email, password, plan, device, phoneNumber, country, city, profile, gender, firstName, lastName, profilePicture, genresPreference, ageGroup } = req.body;

        // Prepare update object
        const updateData = {};
        if (authProvider) updateData.authProvider = authProvider;
        if (email) updateData.email = email;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (plan) updateData.plan = plan;
        if (device) updateData.device = device;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (country) updateData.country = country;
        if (city) updateData.city = city;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (profilePicture) updateData.profilePicture = profilePicture;
        if (genresPreference) updateData.genresPreference = genresPreference;
        if (ageGroup) updateData.ageGroup = ageGroup;
        if (gender) updateData.gender = gender;


        const member = await Members.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json({ message: 'Member updated successfully', member });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a member
const deleteMember = async (req, res) => {
    try {
        const member = await Members.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.status(200).json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add a new profile to a member
const addProfile = async (req, res) => {
    try {
        const { profileName, firstName, lastName, profilePicture, gender, ageGroup, genresPreference, isKidsProfile } = req.body;

        if (!profileName) {
            return res.status(400).json({ message: 'Profile name is required' });
        }

        const member = await Members.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check profile limit
        if (member.profiles.length >= 4) {
            return res.status(400).json({ message: 'Cannot create more than 4 profiles' });
        }

        // Check if profileName already exists
        if (member.profiles.some(p => p.profileName === profileName)) {
            return res.status(400).json({ message: 'Profile name already exists' });
        }

        const newProfile = {
            profileName,
            firstName: firstName || null,
            lastName: lastName || null,
            profilePicture: profilePicture || null,
            gender: gender || null,
            ageGroup: ageGroup || null,
            genresPreference: genresPreference || [],
            isKidsProfile: isKidsProfile || false
        };

        member.profiles.push(newProfile);
        if (!member.defaultProfile) {
            member.defaultProfile = profileName; // Set as default if none exists
        }

        await member.save();
        res.status(201).json({ message: 'Profile added successfully', member });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a specific profile
const updateProfile = async (req, res) => {
    try {
        const { profileName, firstName, lastName, profilePicture, gender, ageGroup, genresPreference, isKidsProfile } = req.body;

        if (!profileName) {
            return res.status(400).json({ message: 'Profile name is required' });
        }

        const member = await Members.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const profile = member.profiles.find(p => p.profileName === profileName);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Update profile fields
        if (firstName !== undefined) profile.firstName = firstName;
        if (lastName !== undefined) profile.lastName = lastName;
        if (profilePicture !== undefined) profile.profilePicture = profilePicture;
        if (gender !== undefined) profile.gender = gender;
        if (ageGroup !== undefined) profile.ageGroup = ageGroup;
        if (genresPreference) profile.genresPreference = genresPreference;
        if (isKidsProfile !== undefined) profile.isKidsProfile = isKidsProfile;

        await member.save();
        res.status(200).json({ message: 'Profile updated successfully', member });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a specific profile
const deleteProfile = async (req, res) => {
    try {
        const { profileName } = req.body;

        if (!profileName) {
            return res.status(400).json({ message: 'Profile name is required' });
        }

        const member = await Members.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const profileIndex = member.profiles.findIndex(p => p.profileName === profileName);
        if (profileIndex === -1) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Remove profile
        member.profiles.splice(profileIndex, 1);

        // Update defaultProfile if it was the deleted profile
        if (member.defaultProfile === profileName) {
            member.defaultProfile = member.profiles.length > 0 ? member.profiles[0].profileName : null;
        }

        await member.save();
        res.status(200).json({ message: 'Profile deleted successfully', member });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Switch default profile
const switchProfile = async (req, res) => {
    try {
        const { profileName } = req.body;

        if (!profileName) {
            return res.status(400).json({ message: 'Profile name is required' });
        }

        const member = await Members.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        if (!member.profiles.some(p => p.profileName === profileName)) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        member.defaultProfile = profileName;
        await member.save();
        res.status(200).json({ message: 'Default profile switched successfully', member });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createMember,
    getAllMembers,
    getMemberById,
    updateMember,
    deleteMember,
    addProfile,
    updateProfile,
    deleteProfile,
    switchProfile
};