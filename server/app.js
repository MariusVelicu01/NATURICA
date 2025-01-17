require('dotenv').config();
const port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const httpLogger = require('morgan')
const cors = require('cors')

const usersRouter = require('./routes/users');
const symptomsRouter = require('./routes/symptoms')
const conditionsRouter = require('./routes/conditions')
const productsRouter = require('./routes/products')
const orderRouter = require('./routes/orders')

app.use(httpLogger('dev'))
app.use(cors())
app.use(express.json());

app.use('/users', usersRouter);
app.use('/symptoms',symptomsRouter);
app.use('/conditions',conditionsRouter);
app.use('/products',productsRouter);
app.use('/orders',orderRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

