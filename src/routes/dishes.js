const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Vendor = require('..//models/vendor');
const auth = require('../middleware/auth');

const router = new express.Router();

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    },
});

router.post('/vendor/addDish', auth, upload.single('dishImage'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    let buf = new Buffer.from(buffer);
    let str = buf.toString('base64');
    const dishObj = { ...req.body, dishImage: str };

    try {
        const vendor = await Vendor.findById(req.vendor._id);
        const addDish = await vendor.addDishes(dishObj);
        res.send(addDish);
    } catch (e) {
        res.status(400).send();
    }

});

router.get('/vendor/dish/search', async (req, res) => {
    let vendorArray = [];

    try {
        const vendor = await Vendor.find()
            .or([
                { "dishes.dishName": { $regex: req.body.param, $options: 'ix' } },
                { vendorName: { $regex: req.body.param, $options: 'ix' } }
            ]);

        if (vendor.length < 1) throw new Error();
        let vendorObj = vendor.map((v) => {
            return {
                _id: v._id,
                vendorName: v.vendorName,
                eta: v.eta,
                contact: v.contactNumber,
                address: v.vendorAddress
            }
        });
        vendorArray.push(vendorObj);
        res.send(vendorArray);
    } catch (e) {
        res.status(404).send('No Vendor Found');
    }
});

router.delete('/vendor/delete/:id', auth, async (req, res) => {

    try {
        const dish = await Vendor.updateOne({ _id: req.vendor._id }, { $pull: { 'dishes': { '_id': req.params.id } } });
        if (!dish.nModified) res.setStatus(404).send('No Dish Found');
        res.send('Deletion Successful');
    } catch (e) {
        console.log(e);
        res.send(400).send();
    }

});

module.exports = router;