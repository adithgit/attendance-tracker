const { urlencoded } = require('express');
const express = require('express');
const app = express();
require('./Database/connection');
const routes = require('./Routes/routes');

app.use(urlencoded({ extended: true }));
app.use(routes);

app.listen(process.env.PORT || 3000, ()=>{
    console.log("listening....");
})