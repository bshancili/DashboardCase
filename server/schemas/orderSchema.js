const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: {
    type: Schema.Types.ObjectId,
    ref: "Variant",
    required: true,
  },
  series: {
    type: String,
    required: true,
  },
  item_count: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  cogs: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  vendor_margin: {
    type: Number,
    required: true,
  },
  order_status: {
    type: String,
    required: true,
  },
});

const orderSchema = new Schema(
  {
    cart_item: {
      type: [cartItemSchema],
      required: true,
    },
    payment_at: {
      type: Date,
      required: true,
    },
  },
  { collection: "orders" },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
