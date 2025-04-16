const mongoose = require('mongoose');

const dbConnection = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected with the Database');
    } catch (error) {
        console.log("Error while connecting with DB.");
    }
};

module.exports = dbConnection;