const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// @route    POST /users
// @desc     Register user
// @access   Public
router.post('/', [
    check('username', 'username is required')
      .not()
      .isEmpty(),
    // check('email', 'Please enter a valid email')
    //   .isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
      .isLength({ min: 6 }),
    check('deposit', 'Use a coin from 5, 10, 20, 20, 50, 100 cents only!')
      .custom( val => {
        if(val < 0) return false;
        if(val < 10 && val%5 !== 0) return false;
        if(val < 20 && val%10 !== 0) return false;
        if(val < 50 && val%20 !== 0) return false;
        if(val < 100 && val%50 !== 0) return false;
        if(val < 101 && val%100 !== 0) return false;
        return true;
    }),
], async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, deposit, email, role} = req.body;

    try {
        let user = await User.findOne({ username });

        if (user) {
            res.status(400).json({ erros: [ { msg: 'User already exists' } ]});
        }

        user = new User({
            username,
            email,
            role,
            password,
            deposit
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);


        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, 'vendorSecret', { expiresIn: 360000 }, (err, token)=>{
            if(err) throw err;
            res.json({ token })
        })

    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: 'server error'});
    }
});

// @route    DELETE /users
// @desc     Delete user
// @access   Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'user removed'})
    } catch (err) {
        res.status(500).json({ msg: err })
    }
});

module.exports = router;