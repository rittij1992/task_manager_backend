const express = require('express');
const app = express();
const Router = require('./routes/IndexRouter');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
dotenv.config();
const port = process.env.PORT || 3081;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const connectToDatabase = require('./configure/config_db');
connectToDatabase();
app.use(express.static("public"));


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', Router);


app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});