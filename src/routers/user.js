/** @format */

const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth.js");
const router = express.Router();

//@REGISTER
//@POST
//@PUBLIC
//@URL: http://localhost:5000/users/register
router.post("/users/register", async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).json({ success: true, data: { user, token } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message, data: { error } });
    }
});
//@LOGIN
//@POST
//@PUBLIC
//@URL: http://localhost:5000/users/login
router.post("/users/login", async (req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        if (!user) {
            return res
                .status(401)
                .json({ success: false, error: "Login failed! Check authentication credentials" });
        }
        const token = await user.generateAuthToken();
        res.status(200).json({ success: true, data: { user, token } });
    } catch (error) {
        console.log(error);
        res.status(400).json({ success: false, message: error.message, data: { error } });
    }
});
//@PROFILE
//@GET
//@AUTH Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGRhZWVkMmVkMDcxYzVjNjM5Y2JiYWEiLCJpYXQiOjE2MjQ5NjE3ODd9.K4G6BMDArugyR1A8ipln6YmEPXu0D5w9_TPlgvpNvp0
//@URL: http://localhost:5000/users/me
router.get("/users/me", auth, async (req, res) => {
    // View logged in user profile
    res.status(200).json({ success: true, data: { user: req.user } });
});
//@LOGOUT
//@POST
//@AUTH Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGRhZWVkMmVkMDcxYzVjNjM5Y2JiYWEiLCJpYXQiOjE2MjQ5NjE3ODd9.K4G6BMDArugyR1A8ipln6YmEPXu0D5w9_TPlgvpNvp0v
//@URL: http://localhost:5000/users/me/logout
router.post("/users/me/logout", auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token;
        });
        //xóa cái token này đi
        await req.user.save();
        res.status(200).json({ success: true, message: "Logout success" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: { error } });
    }
});
//@LOGOUT_ALL
//@POST
//@AUTH Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGRhZWVkMmVkMDcxYzVjNjM5Y2JiYWEiLCJpYXQiOjE2MjQ5NjE3ODd9.K4G6BMDArugyR1A8ipln6YmEPXu0D5w9_TPlgvpNvp0v
//@URL: http://localhost:5000/users/me/logoutall
router.post('/users/me/logoutall', auth, async (req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.status(200).json({ success: true, message: "Logout all devices success" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: { error } });
    }
})
//@LIST_ACOUNT
//@GET
//@AUTH rank = 1
//@URL: http://localhost:5000/users
router.get('/users', auth, async (req, res) => {
    try {
        if (req.rank !== 1) {
            return res
                .status(403)
                .json({ success: false, message: 'Your account does not have this permission' });
        }
        const users = await User.find({ status: { $ne: "DELETE" } }).select("-tokens -password").sort([['updatedAt', -1]]);
        res.status(200).json({ success: true, message: "Find all success", data: { users } });
    } catch (error) {
        res.status(403).json({ success: false, message: error.message, data: { error } });
    }
})
//@DETAIL_ACOUNT
//@GET
//@AUTH
//@URL: http://localhost:5000/users/:id
router.get('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findOne({
            status: { $ne: "DELETE" },
            _id: req.params.id,
        }).select("-password -tokens");
        res.status(200).json({ success: true, message: "Detail user success", data: { user } });
    } catch (error) {
        res.status(403).json({ success: false, message: error.message, data: { error } });
    }
})
//@CREATE_ACOUNT
//@POST
//@AUTH Rank = 1
//@URL: http://localhost:5000/users
router.post('/users', auth, async (req, res) => {
    try {
        if (req.rank !== 1) {
            return res
                .status(403)
                .json({ success: false, message: 'Your account does not have this permission' });
        }
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ success: true, data: { user } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message, data: { error } });
    }
});
//@UPDATE_ACCOUNT
//@PUT
//@AUTH
//@URL: http://localhost:5000/users
router.put('/users/:id', auth, async (req, res) => {
    const data = { ...req.body };
    delete data.tokens;
    try {
        if (req.rank === 1 || req.user.id === req.params.id) {
            if (req.rank !== 1) {
                delete data.rank;
            }
            updateUser = await User.findOneAndUpdate(
                {_id: req.params.id,},data,
                { 
                    new: true ,
                    runValidators: true
                }
            );
            if (!updateUser) {
                return res
                    .status(404)
                    .json({ success: false, message: 'User not found' });
            }
            return res.status(200).json({ success: true, message: 'Update user success', data: { user: updateUser } });
        } else {
            return res
                .status(404)
                .json({ success: false, message: 'Your account does not have this permission' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message, data: { error } });
    }
});
module.exports = router;
