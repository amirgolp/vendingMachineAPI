const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    AmountAvailable: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    productName: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Product = mongoose.model('product', ProductSchema)