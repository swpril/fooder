const express = require('express');
const Vendor = require('..//models/vendor');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.send(vendors);
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true);
  }
});

const type = upload.single('outletPicture');
router.post('/vendors/signup', type, async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .jpeg()
    .toBuffer();
  let bufferData = new Buffer.from(buffer);
  let base64string = bufferData.toString('base64');
  const vendor = new Vendor({ ...req.body, outletPicture: base64string });
  try {
    await vendor.save();
    const token = await vendor.generateAuthToken();
    res.status(201).send({ vendor, token });
  } catch (e) {
    console.log(e);
    res.status(400).send('Could Not signup');
  }
});

router.get('/vendors/me', auth, async (req, res) => {
  res.send(req.vendor);
});

router.post('/vendors/signin', async (req, res) => {
  try {
    const vendor = await Vendor.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await vendor.generateAuthToken();
    res.send({ vendor, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post('/vendors/logout', auth, async (req, res) => {
  try {
    req.vendor.tokens = req.vendor.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.vendor.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/vendors/update', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['vendorName', 'vendorAddress', 'eta'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation)
    return res.status(400).send({ error: 'Invalid updates!' });

  try {
    updates.forEach(update => (req.vendor[update] = req.body[update]));
    await req.vendor.save();
    res.send(req.vendor);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
