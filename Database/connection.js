const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/attendance').then(()=>{
    console.log("mongoose connected");
});

module.exports = mongoose;