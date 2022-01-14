const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route    PUT-POST /deposit
// @desc     Changing user's balance
// @access   Private
router.post('/', [auth, [
    check('deposit', 'Deposit should have any value from this list: [5, 10, 20, 50, 100]')
      .not()
      .isEmpty()
      .custom(
        val => {
            if(val < 0) return false;
            if (val > 100) return false;
            let depoArray = [5, 10, 20, 50, 100];
            if (!depoArray.includes(val)) return false;
            return true;
        })
    ]]
      , async (req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
        }


        const { deposit } = req.body;
    
        let user = await User.findOne({ _id: req.user.id });
        try {
            if (user) {
                user = await User.findOneAndUpdate(
                    { _id: req.user.id },
                    { 
                        $inc: {
                            deposit: deposit
                        }
                    },
                    { new: true }
                );
                    
                return res.json(user);
            }
        } catch (err) {
            res.status(500).json({ msg: err })
        }
});


module.exports = router;