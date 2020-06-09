const express = require('express');
const Vendor = require('..//models/vendor');
const auth = require('../middleware/auth');

const router = new express.Router();

router.get('/', async (req, res) => {

    try {
        const vendor = await Vendor.find();
        res.send(vendor);
    } catch (e) {
        res.status(500).send();
    }

});

router.post('/vendor/signup', async (req, res) => {

    const vendor = new Vendor(req.body);

    try {
        await vendor.save();
        const token = await vendor.generateAuthToken();
        res.status(201).send({ vendor, token });
    } catch (e) {
        res.status(400).send(e);
    }

});


router.post('/vendor/signin', async (req, res) => {

    try {
        const vendor = await Vendor.findByCredentials(req.body.email, req.body.password);
        const token = await vendor.generateAuthToken();
        res.send({ vendor, token });
    } catch (e) {
        res.status(400).send();
    }

});

router.post('/vendor/logout', auth, async (req, res) => {

    try {
        req.vendor.tokens = req.vendor.tokens.filter((token) => { return token.token !== req.token });
        await req.vendor.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }

});


router.patch('/vendor/update', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['vendorName', 'vendorAddress', 'eta'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation)
        return res.status(400).send({ error: 'Invalid updates!' });

    try {
        updates.forEach((update) => req.vendor[update] = req.body[update]);
        await req.vendor.save();
        res.send(req.vendor);
    } catch (e) {
        res.status(400).send(e);
    }

});


module.exports = router;