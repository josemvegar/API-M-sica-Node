const {Schema, model} = require("mongoose");

const songSchema = Schema({
    album:{
        type: Schema.ObjectId,
        ref: "Album"
    },
    track:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    duration:{
        type: String,
        required: true
    },
    file:{
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports= model("Song", songSchema, "songs");