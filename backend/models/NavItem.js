// models/NavItem.js
const mongoose = require('mongoose');

const NavItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  position: { type: Number, required: true },
});

const ContactInfoSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
});

const SocialLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  icon: { type: String, required: true },
});

const LogoSchema = new mongoose.Schema({
  logoUrl: { type: String, required: true },
});

const NavItem = mongoose.model('NavItem', NavItemSchema);
const ContactInfo = mongoose.model('ContactInfo', ContactInfoSchema);
const SocialLink = mongoose.model('SocialLink', SocialLinkSchema);
const Logo = mongoose.model('Logo', LogoSchema);

module.exports = { NavItem, ContactInfo, SocialLink, Logo };
