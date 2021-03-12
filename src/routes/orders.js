const express = require('express');
const Vendor = require('../models/vendor');
const Order = require('../models/orders');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = new express.Router();

router.post('/orders', async (req, res) => {
  try {
    const orderObj = {
      ...req.body,
      orderId: uuidv4(),
      owner: req.body.ownerId
    };
    const order = new Order(orderObj);
    await order.save();
    res.status(201).send(order);
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/orders/status', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.body.orderId });
    if (!order) res.status(404).send();
    res.send(order);
  } catch (e) {
    res.status(400).send();
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find();
    if (orders.length < 1) throw new Error('No order found');
    res.send(orders);
  } catch (e) {
    res.status(404).send();
  }
});

router.patch('/orders/update/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById({ _id: req.params.id });
    if (!order) throw new Error('No order found');
    order.orderStatus = req.body.orderStatus;
    await order.save();
    res.send(order);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
