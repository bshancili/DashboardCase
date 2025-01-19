const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
  },
  { collection: "parent_products" }
);

const Parent_Product = mongoose.model("Parent_Product", productSchema);

module.exports = Parent_Product;
