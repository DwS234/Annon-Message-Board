const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema({
   text: {
       type: String,
       required: true
   },
   created_on: {
       type: Date,
       default: new Date()
   },
   bumped_on: {
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
   replies: [
       {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Reply"
       }
   ]
});

module.exports = mongoose.model("Thread", ThreadSchema);