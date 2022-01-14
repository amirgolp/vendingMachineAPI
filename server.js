const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env variables
dotenv.config({ path: './config/config.env'});

// Conencting to mongoDB Atlas
const conenctDB = async () => {
  try {
      await mongoose.connect(process.env.mongoURI);
      console.log('mongoDB Atlas connection is successful ...')
  } catch (err) {
      console.error(err.message);
  }
}
conenctDB();

const app = express();

// Initialize the middleare for json objects
app.use(express.json({ extended: false }));

// test route: nginx reverse proxy for microservice arcitecture  
app.get('/test', (req, res) => res.status(200).json({ message: 'API is up and running'}));

// Define Routes
app.use('/users', require('./routes/api/users'));
app.use('/auth', require('./routes/api/auth'));
app.use('/products', require('./routes/api/products'));
app.use('/deposit', require('./routes/api/deposit'));
app.use('/buy', require('./routes/api/buy'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT} in ${process.env.NODE_ENV} mode`));