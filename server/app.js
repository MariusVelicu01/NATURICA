require('dotenv').config();
const port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const httpLogger = require('morgan')
const cors = require('cors')

const testDbCOnnection = require('./routes/testFirebaseConnection');
const usersRouter = require('./routes/users');
const symptomsRouter = require('./routes/symptoms')
const conditionsRouter = require('./routes/conditions')

app.use(httpLogger('dev'))
app.use(cors())
app.use(express.json());

app.use('/users', usersRouter);
app.use('/test',testDbCOnnection)
app.use('/symptoms',symptomsRouter);
app.use('/conditions',conditionsRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

