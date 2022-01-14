const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST auth
// @desc     Authenticate user and receive token
// @access   Public
router.post('/', [
    check('username', 'Username is required')
      .exists(),
    check('password', 'Password is required')
      .exists()
], async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            res.status(400).json({ erros: [ { msg: 'Invalid Credentials' } ]});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(400).json({ erros: [ { msg: 'Invalid Credentials' } ]});
        }
        
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

module.exports = router;