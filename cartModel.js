const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Image = mongoose.model('images', new mongoose.Schema({}));
const cartSchema = new Schema({
  products: [{ type: Schema.Types.ObjectId, ref: 'images' }],
});
  

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;