const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const server = express();
server.use(cors());

server.use(express.json()); // JSON पार्सर मिडलवेयर
server.use(express.urlencoded({ extended: true })); // URL-encoded पार्सर मिडलवेयर

server.get('/', (request, response) => {
    response.send('Server Working Fine.....');
})

require('./src/routes/backend/images.routes')(server);
require('./src/routes/backend/two.images.routes')(server);
require('./src/routes/frontend/register.routes')(server);

server.get('*', (request, response) => {
    response.send('Page not found.....');
})


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(process.env.PORT || 5000, () => {
            console.log('✅ Database Connected!');
        });
    })
    .catch((error) => {
        console.error('❌ Database Not Connected!\n', error);
    });