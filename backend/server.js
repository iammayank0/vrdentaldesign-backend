// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const navbarRoutes = require('./routes/navbar');
const bannerRoutes = require('./routes/banner');
const enquiryRoutes = require('./routes/enquiry');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const MONGODB_URI = 'mongodb+srv://iammayank1628:vrdental%401234@vrdentaldesign.p2gimxu.mongodb.net/';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

app.use('/api', navbarRoutes);
app.use('/api', bannerRoutes);
app.use('/api/enquiry', enquiryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
