const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
    name: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'product',
    },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const cartModel = mongoose.models.cart || mongoose.model('cart', cartSchema);
export default cartModel;
