const mongoose = require('mongoose');

const connectToDataBase = ()=>{
    const url = 'mongodb://0.0.0.0:27017/store_db';
    return mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((()=> console.log('Connected to MongoDB!')))
    .catch(error => console.log('Could not connect to MongoDb', error))
}

module.exports = connectToDataBase;