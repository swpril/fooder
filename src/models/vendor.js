const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const Order = require('./orders');

const vendorSchema = new mongoose.Schema({

    vendorName: {
        type: String,
        trim: true,
        required: true
    },

    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    contactNumber: {
        type: Number,
        required: true,
        unique: true
    },

    vendorAddress: {
        type: String,
        required: true
    },

    eta: {
        type: Number,
        required: true
    },

    dishes: [{

        dishName: {
            type: String,
            trim: true
        },

        dishType: {
            type: String,
            trim: true
        },

        dishCategory: {
            type: String,
            trim: true
        },

        cuisineType: {
            type: String,
            trim: true
        },

        price: {
            type: Number
        },

        dishImage: {
            type: String,
        },


    }],

    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],

    outletPicture: {
        type: Buffer
    }

});

vendorSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'owner'
});


vendorSchema.methods.toJSON = function () {
    const vendor = this;
    const vendorObject = vendor.toObject();

    delete vendorObject.password;
    delete vendorObject.tokens;

    return vendorObject;
}

vendorSchema.methods.addDishes = async function (dish) {

    const vendor = this;
    vendor.dishes = vendor.dishes.concat(dish);
    await vendor.save();
    return vendor;

}

vendorSchema.methods.generateAuthToken = async function () {
    const vendor = this;
    const token = jwt.sign({ _id: vendor._id.toString() }, process.env.JWT_SECRET);

    vendor.tokens = vendor.tokens.concat({ token });

    await vendor.save();

    return token;
}


vendorSchema.pre('save', async function (next) {
    const vendor = this;

    if (vendor.isModified('password'))
        vendor.password = await bcrypt.hash(vendor.password, 8);

    next();
});

vendorSchema.statics.findByCredentials = async (email, password) => {
    const vendor = await Vendor.findOne({ email });
    if (!vendor)
        throw new Error('Unable to login');
    const isMatch = await bcrypt.compare(password, vendor.password)
    if (!isMatch)
        throw new Error('Unable to login');

    return vendor;
}

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;