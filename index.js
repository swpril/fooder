const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('./src/database/db');

const vendorRouter = require('./src/routes/vendor');
const dishesRouter = require('./src/routes/dishes');
const orderRouter = require('./src/routes/orders');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(vendorRouter);
app.use(dishesRouter);
app.use(orderRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is up on PORT ${PORT}`);
});
