// commentModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = mongoose.model('users', new mongoose.Schema({}));
const commentSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true },// ref: 'images',
    // user: {
    //   userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    nickname: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    
    // },
    commentText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [
      {
        nickname: { type: Schema.Types.ObjectId, ref: 'users', required: true }, // Reference to the nickname field in the users collection
        commentText: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  });
  

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
