const Users = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const { name, email_id, password } = req.body;

        if (!name || !email_id || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }


        const existingUser = await Users.findOne({ email_id });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be alphanumeric and at least 8 characters long',
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new Users({
            name,
            email_id,
            password: hashPassword
        })
        const data = await user.save();


        res.status(201).json({
            message: 'User registered successfully',
            data
        })


    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}


exports.loginUser = async (req, res) => {
    try {
        const { email_id, password } = req.body;

        if (!email_id || !password) {
            return res.status(400).json({ message: 'Both email and password are required' });
        }

        const user = await Users.findOne({ email_id });
        if (!user) {
            return res.status(404).json({ message: 'email id or password invalid' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid user name or password" })
        }

        const token = jwt.sign(
            { userId: user._id, userName: user.user_name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email_id,
            },
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
}