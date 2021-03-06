const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config')
const bcrypt = require('bcryptjs');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Private
router.get('/', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        return res.json(user);
    }
    catch(err) {
        console.error(err);
        res.status(500);
    }
});

// @route   GET api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

        let user = await User.findOne( { email });
        if(!user) {
            return res.status(400).json({ errors: [ { msg: 'Invalid credentials' }]})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ errors: [ { msg: 'Invalid credentials' }]})
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 3600 },
            (err, token) => {
                if(err) throw err;
                res.json( {
                     _id: user._id,
                     name: user.name,
                     email: user.email,
                     avatar: user.avatar,
                     date: user.date,
                     token 
                    });
            });
    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

});


module.exports = router;