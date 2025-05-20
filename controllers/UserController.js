const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const crypto = require('crypto'); // Built-in Node.js module for hashing
dotenv.config();

const verifyUser = async (req, res) => {

    const token = await jwt.verify(req.body.verifytok, process.env.JWT_SECRET_KEY, (err, decode) => {



        if (err) {
            // Token verification failed
            res.json({ error: err.message });
        } else {
            // Token is valid, decoded contains the decoded payload,

            res.json({ data: decode, user: decode.email });

        }
    });

};

const checkUserbyEmail = async (email) => {
    const user = User.findOne({
        email: "admin@aryzap.com"
    });

    try {
        return user;
    } catch (err) {
        return err.message;
    }

}

const signInUser = async (req, res) => {

    const user = await User.findOne({
        email: req.body.email
    });
    if (user) {
        if (!user.comparePassword(req.body.password)) {
            return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
        }
        return res.json({ token: jwt.sign({ email: user.email, userName: user.username, _id: user._id, xAccess: user.access }, process.env.JWT_SECRET_KEY) });
    }
}

//Get all Users

const getAllUsers = async (req, res) => {
    try {
        const user = await User.find().select("-password");
        res.json(user);
    } catch (err) {
        res.json({ message: err });
    }
};

//Get a specific user

const getSpecificUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('appId');
        //user.comparePassword("khurrams")
        res.json(user);
    } catch (err) {
        res.json({ message: err });
    }
};

//Create a new user

const createUser = async (req, res) => {

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        image: req.body.image,
        role: req.body.role,
        appId: req.body.appId,
        access: req.body.access
    });

    try {
        const savedUser = await user.save();
        res.json(savedUser);
    } catch (err) {
        res.json({ message: err });
    }
};

//Update a user

const updateUser = async (req, res) => {

    try {

        const updatedUser = await User.updateOne(
            { _id: req.params.userId },
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    image: req.body.image,
                    role: req.body.role,
                    appId: req.body.appId,
                    access: req.body.access
                },
            }
        );
        res.json(updatedUser);
    } catch (err) {
        res.json({ message: err });
    }
};

//Delete a user

const deleteUser = async (req, res) => {
    try {
        const removedUser = await User.deleteOne({ _id: req.params.userId });
        res.json(removedUser);
    } catch (err) {
        res.json({ message: err });
    }
};

const genPass = async (req, res) => {
    const password = req.params.password;

    const md5 = crypto.createHash('md5').update(password).digest('hex');

    res.json({ md5: md5 })
}

module.exports = {
    getSpecificUser,
    createUser,
    updateUser,
    deleteUser,
    signInUser,
    verifyUser,
    getAllUsers,
    genPass
};