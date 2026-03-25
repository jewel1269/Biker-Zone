const express = require("express");

const checkPassword = require("../middlewares/news.auth");
const newsController = require("../controllers/newsController");
const uploadNewsImages = require("../middlewares/uploadNewsImages");

const router = express.Router();

router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getSingleNews);

router.post("/", uploadNewsImages, newsController.createNews);
router.patch("/:id", checkPassword, uploadNewsImages, newsController.updateNews);
router.delete("/:id", checkPassword, newsController.deleteNews);

module.exports = router;
