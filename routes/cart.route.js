import { Router } from "express";
import auth from "../middlewares/auth.js";
import { addToCartItem, deleteCartItemController, emptyCartController, getCartItem, updateCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";

const cartRouter = Router();
cartRouter.post("/add", auth, addToCartItem);
cartRouter.get("/get", auth, getCartItem);
cartRouter.put("/update-qty", auth, updateCartItemQtyController);
cartRouter.put("/update", auth, updateCartItemController);
cartRouter.delete("/delete/:_id", auth, deleteCartItemController);
cartRouter.delete("/emptyCart/:id", auth, emptyCartController);

export default cartRouter;