import { Router } from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { createCategory, deleteCategory, getCategories, getCategoriesCount, getCategory, getSubCategoriesCount, removeImageController, updatedCategory, uploadImage } from "../controllers/category.controller.js";
import { addHomeSlider, deleteHomeSlide, getHomeSlides, getSlide } from "../controllers/homeSlider.controller.js";

const homeSlidesRoute = Router();
homeSlidesRoute.post("/upload", auth, upload.array("images"), uploadImage);
homeSlidesRoute.post("/create", auth, addHomeSlider);
homeSlidesRoute.get("/", getHomeSlides);
homeSlidesRoute.get("/:id", getSlide);
homeSlidesRoute.delete("/:id", deleteHomeSlide);

export default homeSlidesRoute;