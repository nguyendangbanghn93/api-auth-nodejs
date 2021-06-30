/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const Topic = require('./TopicModels')

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 150
    },
    description: {
        type: String,
    },
    detail: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 2000
    },
    poster: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
