const mongoose = require("mongoose");

const BoardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    threads: [
        {
            ref: "Thread",
            type: mongoose.Schema.Types.ObjectId
        }
    ]
});

module.exports = mongoose.model("Board", BoardSchema);