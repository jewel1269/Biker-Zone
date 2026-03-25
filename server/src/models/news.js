const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    caption: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [180, "Title must be at most 180 characters"],
    },
    author: {
      type: String,
      trim: true,
      default: "Communications Team",
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "Summary is required"],
      maxlength: [600, "Summary must be at most 600 characters"],
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Content is required"],
    },
    category: {
      type: String,
      enum: [
        "Internal Announcement",
        "Press Release",
        "Quarterly Report",
        "Corporate Update",
      ],
      default: "Internal Announcement",
    },
    status: {
      type: String,
      enum: ["Draft", "Review", "Published"],
      default: "Draft",
    },
    coverImage: imageSchema,
    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 10;
        },
        message: "Maximum 10 gallery images are allowed",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
