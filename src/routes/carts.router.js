
import express from "express";
import { productManagerDB } from "../dao/ProductManagerDB.js";
import cartManagerDB from "../dao/cartManagerDB.js"

const router = express.Router();
const ProductService = new productManagerDB();
const CartService = new cartManagerDB(ProductService);

//Obtener todos los carritos (para hacer pruebas)
router.get("/", async (req, res) => {
  const result = await CartService.getAllCarts();
  return res.status(200).send(result);
});

//Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const result = await CartService.getCartById(req.params.cid);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

//Crear un carrito
router.post("/", async (req, res) => {
  try {
    const { products } = req.body;
    const result = await CartService.createCart(products);
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

//Agregar un producto a un carrito por ID
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const result = await CartService.addProductByID(
      req.params.cid,
      req.params.pid
    );
    res.send({
      status: "success",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartService.deleteProductInCart(cid, pid);
    if (!cart) {
      return res.status(400).send({
        status: "error",
        message: error.message,
      });
    }
    return res.send({
      status: "success",
      message: `ID del producto eliminado: ${pid}`,
      cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

// Actualizar el carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
  try {
    const result = await CartService.updateCart(
      req.params.cid,
      req.body.products
    );
    res.send({
      status: "success",
      message: "Carrito actualizado correctamente",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    let { quantity } = req.body;
    quantity = parseInt(quantity);
    const result = await CartService.updateProductQuantity(cid, pid, quantity);
    res.send({
      status: "success",
      cart: result,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

// Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const result = await CartService.clearCart(req.params.cid);
    res.send({
      status: "success",
      message: "Carrito vaciado",
      payload: result,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
