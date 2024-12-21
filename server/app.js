require('dotenv').config();
const port = process.env.PORT || 3000;
const express = require('express')
const app = express()
const httpLogger = require('morgan')
const cors = require('cors')
const testDbCOnnection = require('./routes/testFirebaseConnection');

const usersRouter = require('./routes/users');

const errorHandler = require('./middleware/errorHandler')

app.use(httpLogger('dev'))
app.use(cors())
app.use(express.json());


app.use('/users', usersRouter);
app.use('/test',testDbCOnnection)


app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY);