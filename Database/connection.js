const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://otto:otto@cluster0.0v04fqr.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    console.log("mongoose connected");
});

module.exports = mongoose;