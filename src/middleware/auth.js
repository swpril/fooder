const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const Vendor = require('../models/vendor');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendor = await Vendor.findOne({
      _id: decoded._id,
      'tokens.token': token
    });

    if (!vendor) {
      throw new Error();
    }

    req.token = token;
    req.vendor = vendor;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Authorization Required' });
  }
};

module.exports = auth;
