const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Product = require('../../models/Product');

// @route    Post /products
// @desc     Create or update product
// @access   private
router.post('/', [auth, [
    check('productName', 'Product should have a name')
      .not()
      .isEmpty(),
    check('price','The price should be devisible by 5')
      .notEmpty()
      .not()
      .isString()
      .custom( val => {
          if(val < 0) return false;
          if (val % 5 !== 0) return false;
          return true;
      }),
      check('AmountAvailable','The amount of this product should be at least zero.')
      .notEmpty()
      .not()
      .isString()
      .custom( val => {
          if(val < 0) return false;
          if(val % 1 !== 0) return false;
          return true;
      }),
]
], async (req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    }

    const {
        AmountAvailable,
        price,
        productName
    } = req.body;

    const productInfo = {};
    productInfo.user = req.user.id;
    if (price) productInfo.price = price;
    if (productName) productInfo.productName = productName;
    if (AmountAvailable) productInfo.AmountAvailable = AmountAvailable;

    try {
        // Checking if the productName belongs to user
        let product = await Product.findOne({ productName, user: req.user.id});
        if (product) {
            // It means the seller wants to update the entries

            product = await Product.findOneAndUpdate(
                { productName },
                // { $set: productInfo },
                { 
                    $inc: {
                        AmountAvailable: AmountAvailable
                    },
                    $set: {
                        price: price
                    }
            },
                { new: true }
            );
                
            return res.json(product);
        }

        // if productName exists but the above condition is not satisfied, it means that the logged in user is not the product owner 
        if (await Product.findOne({ productName })) return res.status(401).send('You are not authorized to perform this action');

            // Create a new product
        product = new Product(productInfo);
        await product.save();
        res.json(product)
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'server error'})
    }


});

// @route    Get /products
// @desc     Get all products
// @access   Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('user', ['username']);
        res.json(products)
    } catch (err) {
        res.status(500).json({ msg: err })
    }
});

// @route    DELETE /products
// @desc     Delete product
// @access   Private
router.delete('/', [auth, [
    check('productName', 'Product should have a name')
      .not()
      .isEmpty() ]]
      , async (req, res) => {
        const {productName} = req.body;

        // Checking if the productName belongs to user
        let product = await Product.findOne({ productName, user: req.user.id });
        try {
            if (product)
            // Remove product
            await Product.findOneAndRemove({ productName });
            res.json({ msg: 'Product removed.'})
        } catch (err) {
            res.status(500).json({ msg: err })
        }
});


module.exports = router;