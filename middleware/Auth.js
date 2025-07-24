const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next)=>{
    const token = req.header('Authorization');
    if(!token){
        return res.status(401).json({message: 'Token not found'});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');
        next();
    } catch (error) {
        res.status(500).json({message: "Server Error: " + error.message});
    }
};