import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addAddressController, deleteAddressController, getAddressController, selectAddressController } from "../controllers/address.controller.js";

const addressRouter = Router();
addressRouter.post("/add", auth, addAddressController);
addressRouter.get("/get", auth, getAddressController);
addressRouter.put("/selectAddress/:id", auth, selectAddressController);
addressRouter.delete("/delete/:id", auth, deleteAddressController);

export default addressRouter;