/** @format */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const data = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({
            status:"ACTIVE",
            _id: data._id,
            "tokens.token": token,
        })
            .select("-password"); //bỏ password và token khi lấy thông tin tài khoản // .select("-password -tokens");
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        //phân quyền theo cấp bậc tài khoản
        req.rank = user.rank;
        next();
    } catch (error) {
        res.status(401).json({success:false, status:401, message: "Not authorized to access this resource" });
    }
};
module.exports = auth;


