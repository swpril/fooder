const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true,
    },

    customerName: {
        type: String,
        trim: true,
        required: true
    },

    customerEmail: {
        type: String,
        trim: true,
        required: true
    },

    customerPhone: {
        type: Number,
        required: true
    },

    customerAddress: {
        type: String,
        required: true,
    },

    orderStatus: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor'
    }
},
    {
        timestamps: true
    }
);

orderSchema.methods.generateOrderId = async function () {
    const order = this;
    const orderID = uuidv4();

    order.orderId = orderID;

    await order.save();

    return order;
}

const Order = mongoose.model('Order', orderSchema);


module.exports = Order;