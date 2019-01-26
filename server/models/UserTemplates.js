const mongoose = require('mongoose');

const UserTemplatesSchema = new mongoose.Schema({
  userHtml: {
    type: String,
    default: ''
  },
  userCss: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  token: {
    type: String,
    default: ''
  },
  fileDate: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('UserTemplates', UserTemplatesSchema)
