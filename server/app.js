const express = require('express')
const app = express()
const httpLogger = require('morgan')
const cors = require('cors')
const port = 3000;

app.use(httpLogger('dev'))
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});