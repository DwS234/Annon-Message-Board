const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
   text: {
       type: String,
       required: true
   },
   created_on: {
       type: Date,
       default: new Date()
   },
   reported: {
       type: Boolean,
       default: false
   },
   delete_password: {
       type: String,
       required: true
   },
});

module.exports = mongoose.model("Reply", ReplySchema);