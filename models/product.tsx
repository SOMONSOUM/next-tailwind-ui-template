const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: true },
    offerEnd: { type: Date, required: true },
    new: { type: Boolean, required: true },
    rating: { type: Number, required: true },
    saleCount: { type: Number, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'category',
    },
    tags: { type: Array, required: true, default: [] },
    variation: [
      {
        color: { type: String, require: true },
        image: { type: String, require: true },
        size: [
          {
            name: { type: String, require: true },
            stock: { type: Number, require: true },
          },
        ],
      },
    ],
    images: { type: Array, required: true, default: [] },
    shortDescription: { type: String, required: true },
    fullDscriptDescription: { type: String, required: true },
  },
  { timestamps: true }
);

const productModel =
  mongoose.models.product || mongoose.model('product', productSchema);
export default productModel;
