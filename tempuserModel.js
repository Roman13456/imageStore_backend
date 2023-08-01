const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tempuserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    nickname: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, default: Date.now, expires: '30m' },
});

const Tempuser = mongoose.model('Tempuser', tempuserSchema);
module.exports = Tempuser;