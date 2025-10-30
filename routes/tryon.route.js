import express from "express";
import multer from "multer";
import { tryOnController } from "../controllers/tryon.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("userImage"), tryOnController);

export default router;
