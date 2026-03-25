const News = require("../models/news");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { uploadBufferToCloudinary } = require("../config/cloudinary");

const normalizeGalleryMetadata = (body) => {
  if (Array.isArray(body.gallery_metadata)) return body.gallery_metadata;

  if (typeof body.gallery_metadata === "string") {
    try {
      const parsed = JSON.parse(body.gallery_metadata);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  const rows = [];
  const matcher = /^gallery_metadata\[(\d+)\]\[(title|caption)\]$/;

  Object.entries(body).forEach(([key, value]) => {
    const matched = key.match(matcher);
    if (!matched) return;

    const index = Number(matched[1]);
    const field = matched[2];
    rows[index] = rows[index] || { title: "", caption: "" };
    rows[index][field] = value || "";
  });

  return rows.filter(Boolean);
};

const uploadImagesIfPresent = async (files, body) => {
  const coverFile = files?.cover_image?.[0];
  const galleryFiles = files?.gallery_images || [];
  const galleryMetadata = normalizeGalleryMetadata(body);

  let coverImage = null;
  if (coverFile) {
    const uploadedCover = await uploadBufferToCloudinary(
      coverFile.buffer,
      "news/cover-images"
    );
    coverImage = {
      url: uploadedCover.secure_url,
      publicId: uploadedCover.public_id,
      width: uploadedCover.width,
      height: uploadedCover.height,
      format: uploadedCover.format,
      originalName: coverFile.originalname,
    };
  }

  const images = [];
  for (let i = 0; i < galleryFiles.length; i += 1) {
    const file = galleryFiles[i];
    const uploaded = await uploadBufferToCloudinary(
      file.buffer,
      "news/gallery-images"
    );

    const meta = galleryMetadata[i] || {};
    images.push({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      originalName: file.originalname,
      title: meta.title || "",
      caption: meta.caption || "",
    });
  }

  return { coverImage, images };
};

// CREATE
exports.createNews = catchAsync(async (req, res) => {
  const { title, summary, content, category, author, status } = req.body;

  if (!title || !summary) {
    throw new AppError("Title and summary are required", 400);
  }

  const { coverImage, images } = await uploadImagesIfPresent(req.files, req.body);

  const newNews = await News.create({
    title,
    summary,
    content,
    category,
    author,
    status,
    coverImage,
    images,
  });

  res.status(201).json({
    status: "success",
    data: {
      data: newNews,
    },
  });
});

// UPDATE
exports.updateNews = catchAsync(async (req, res) => {
  const updates = { ...req.body };
  const { coverImage, images } = await uploadImagesIfPresent(req.files, req.body);

  if (coverImage) updates.coverImage = coverImage;
  if (images.length > 0) updates.images = images;

  const updated = await News.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new AppError("News not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: updated,
    },
  });
});

// DELETE
exports.deleteNews = catchAsync(async (req, res) => {
  const deleted = await News.findByIdAndDelete(req.params.id);

  if (!deleted) {
    throw new AppError("News not found", 404);
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// GET SINGLE
exports.getSingleNews = catchAsync(async (req, res) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    throw new AppError("News not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: news,
    },
  });
});

// GET ALL (with pagination + search)
exports.getAllNews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const query = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  const skip = (pageNumber - 1) * limitNumber;

  const news = await News.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  const total = await News.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: news.length,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
    data: {
      data: news,
    },
  });
});
