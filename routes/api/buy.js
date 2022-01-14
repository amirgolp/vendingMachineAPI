const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Product = require('../../models/Product');

// @route    POST /buy
// @desc     Changing user's balance
// @access   Private
router.post('/', [auth, [
    check('productNames', 'Select atleast one product')
      .not()
      .isEmpty(),
    check('amount', 'select an amount greater than 0')
      .not()
      .isEmpty()
    ]]
      , async (req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
        }


        const { productNames, amount } = req.body;
        let user = await User.findOne({ _id: req.user.id });
        let totalPriceRequestedByUser = 0; 
        let userBalance = user.deposit;
        let product = await Product.findOne({ productName: productNames[0] });

        productNames.forEach( async (item, index) => {
            let productPrice = product.price;
            let amountAvail = product.AmountAvailable;
            totalPriceRequestedByUser += productPrice * amount[index];

            if (amount[index] > amountAvail) return res.status(400).json({ msg: 'Requested amount is larger than total amount in the stock' });
            if (totalPriceRequestedByUser > userBalance ) return res.status(400).json({ msg: 'insufficient funds. Consider adding credits to your balance' });

            product = await Product.findOneAndUpdate(
                { productName: item },
                { 
                    $inc: {
                        AmountAvailable: -amount[index]
                    }
                },
                { new: true }
            );
        });
        try {
            if (totalPriceRequestedByUser) {
                user = await User.findOneAndUpdate(
                    { _id: req.user.id },
                    { 
                        $inc: {
                            deposit: -totalPriceRequestedByUser
                        }
                    },
                    { new: true }
                );
                console.log(user.deposit)
                let coin100 = Math.max(Math.floor(user.deposit/100), 0);
                let coin50 = Math.max(Math.floor((user.deposit-coin100*100)/50), 0);
                let coin20 = Math.max(Math.floor((user.deposit-coin100*100-coin50*50)/20), 0);
                let coin10 = Math.max(Math.floor((user.deposit-coin100*100-coin50*50-coin20*20)/10), 0);
                let coin5 = Math.max(Math.floor((user.deposit-coin100*100-coin50*50-coin20*20-coin10*10)/5), 0);
                let coinObject = {
                    "100": coin100,
                    "50": coin50,
                    "20": coin20,
                    "10": coin10,
                    "5": coin5,
                }
                return res.json({ totalPriceRequestedByUser, productNames , coinObject});
            }
        } catch (err) {
            res.status(500).json({ msg: err })
        }
});


module.exports = router;