const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Legal",
        "CA Services",
        "GST",
        "Trademark",
        "Patent",
        "Software Dev",
        "UI/UX",
        "Digital Marketing",
        "Fundraising Consultants",
      ],
    },
    price: {
      type: String, // String to allow things like "₹5,000 / hr" or "Custom"
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    coverImage: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
