// Import Dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Models
const Vendor = require("./schemas/vendorSchema");
const Order = require("./schemas/orderSchema");
const Parent_Product = require("./schemas/parentProductSchema");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

// Route: Get All Vendors
app.get("/vendors", async (req, res) => {
  try {
    // Attempt to fetch all vendor documents from the database using the Vendor model
    const vendors = await Vendor.find({});

    // If successful, send the retrieved vendor data as a JSON response
    res.json(vendors);
  } catch (err) {
    // Log an error message to the console if fetching vendors fails
    console.log("Error fetching vendors:", err);

    // Send a 500 status code and an error message to indicate a server error
    res.status(500).send("Server Error");
  }
});

// Route: Get All Orders
app.get("/orders", async (req, res) => {
  try {
    // Attempt to fetch all order documents from the database using the Order model
    const orders = await Order.find({});

    // If successful, send the retrieved order data as a JSON response
    res.json(orders);
  } catch (err) {
    // Log an error message to the console if fetching orders fails
    console.log("Error fetching orders:", err);

    // Send a 500 status code and an error message to indicate a server-side error
    res.status(500).send("Server Error");
  }
});

// Route: Get Products from a Spesific Vendor
app.get("/parent_products/:vendorId", async (req, res) => {
  // Extract the vendorId from the request parameters
  const { vendorId } = req.params;

  try {
    // Step 1: Fetch all parent products associated with the specified vendor
    const products = await Parent_Product.find({
      vendor: new mongoose.Types.ObjectId(vendorId), // Convert vendorId to a MongoDB ObjectId
    });

    // Step 2: Aggregate sales data for the retrieved products
    const productSalesData = await Order.aggregate([
      {
        $unwind: "$cart_item", // Deconstruct the cart_item array into individual documents
      },
      {
        $match: {
          // Match only those orders where the product is in the retrieved products' IDs
          "cart_item.product": { $in: products.map((product) => product._id) },
        },
      },
      {
        $group: {
          _id: "$cart_item.product", // Group by product ID
          total_sales: {
            $sum: {
              // Calculate total sales by multiplying item_count and quantity
              $multiply: ["$cart_item.item_count", "$cart_item.quantity"],
            },
          },
        },
      },
    ]);

    // Step 3: Merge sales data with product information
    const productsWithSales = products.map((product) => {
      // Find the sales data for the current product
      const salesData = productSalesData.find(
        (sales) => sales._id.toString() === product._id.toString()
      );

      // Return the product with an additional `allTimeSales` field
      return {
        ...product.toObject(), // Convert the Mongoose document to a plain object
        allTimeSales: salesData ? salesData.total_sales : 0, // Add sales data or default to 0
      };
    });

    // Step 4: Send the enriched product data as a JSON response
    res.json(productsWithSales);
  } catch (err) {
    // Handle any errors that occur during the process
    console.error("Error fetching products with sales:", err);

    // Respond with a 500 status code to indicate a server error
    res.status(500).send("Server Error");
  }
});

// Route: Get Monthly Sales Data
app.get("/monthly-sales", async (req, res) => {
  // Extract startDate and endDate from the query parameters
  const { startDate, endDate } = req.query;

  try {
    // Convert the start and end date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set the end date to the last millisecond of the specified day (23:59:59.999)
    end.setHours(23, 59, 59, 999);

    // Perform an aggregation on the Order collection
    const salesData = await Order.aggregate([
      {
        // Unwind the cart_item array to handle individual items in each order
        $unwind: "$cart_item",
      },
      {
        // Perform a lookup to join the Parent_Product collection to get product details
        $lookup: {
          from: "parent_products", // Collection to join
          localField: "cart_item.product", // Field in Order collection to match
          foreignField: "_id", // Field in Parent_Product collection to match
          as: "product_info", // Name of the new field to hold the joined data
        },
      },
      {
        // Unwind the product_info array so that we can access individual product details
        $unwind: "$product_info",
      },
      {
        // Filter orders based on the payment_at date, ensuring they are within the specified date range
        $match: {
          payment_at: {
            $gte: start, // Start date (inclusive)
            $lte: end, // End date (inclusive)
          },
        },
      },
      {
        // Group by vendor, month, and year of payment_at and calculate total sales and orders
        $group: {
          _id: {
            vendor: "$product_info.vendor", // Group by vendor
            month: { $month: "$payment_at" }, // Extract month from payment_at
            year: { $year: "$payment_at" }, // Extract year from payment_at
          },
          total_sales: { $sum: "$cart_item.cogs" }, // Sum of cost of goods sold (cogs) for total sales
          total_orders: {
            $sum: {
              // Sum of item_count multiplied by quantity for total order count
              $multiply: ["$cart_item.item_count", "$cart_item.quantity"],
            },
          },
        },
      },
      {
        // Lookup the Vendor collection to get vendor details based on the vendor ID
        $lookup: {
          from: "vendors", // Collection to join
          localField: "_id.vendor", // Field in grouped data to match with the vendors' _id
          foreignField: "_id", // Field in Vendor collection to match
          as: "vendor_info", // Name of the new field to hold the joined data
        },
      },
      {
        // Unwind the vendor_info array to access individual vendor data
        $unwind: "$vendor_info",
      },
      {
        // Project the necessary fields, including vendor name, total sales, and total orders
        $project: {
          vendor_name: "$vendor_info.name", // Vendor name
          total_sales: 1, // Total sales from the previous group stage
          total_orders: 1, // Total orders from the previous group stage
          month: "$_id.month", // Month of the payment date
          year: "$_id.year", // Year of the payment date
        },
      },
      {
        // Sort the results by year and month in ascending order
        $sort: {
          year: 1, // Sort by year (ascending)
          month: 1, // Sort by month (ascending)
        },
      },
    ]);

    // Send the aggregated sales data as a JSON response
    res.json(salesData);
  } catch (err) {
    // Log any errors that occur and send a 500 status code with an error message
    console.error("Error fetching sales data:", err);
    res.status(500).send("Server Error");
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
