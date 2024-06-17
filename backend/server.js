// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const navbarRoutes = require('./routes/navbar');
const bannerRoutes = require('./routes/banner');
const enquiryRoutes = require('./routes/enquiry');
const aboutRoutes = require('./routes/about');
const factRoutes = require('./routes/fact');
const serviceRoutes = require('./routes/service');
const whychooseusRoutes = require('./routes/whychooseus');
const doctorRoutes = require('./routes/doctor');
const ctaRoutes = require('./routes/cta');
const PartnerRoutes = require('./routes/partner');
const BlogRoutes = require('./routes/blog');
const FooterRoutes = require('./routes/footer');

const app = express();
const PORT = 5000;

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
app.use('/api', aboutRoutes);
app.use('/api', factRoutes);
app.use('/api', serviceRoutes);
app.use('/api', whychooseusRoutes);
app.use('/api', doctorRoutes);
app.use('/api', ctaRoutes);
app.use('/api', PartnerRoutes);
app.use('/api', BlogRoutes);
app.use('/api', FooterRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
