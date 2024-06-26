import { Router } from "express";
import { productModel } from "../dao/models/productModel.js";
import { cartModel } from "../dao/models/cartModel.js";
import { productManagerDB } from "../dao/ProductManagerDB.js";
import { auth } from "../middleware/middleware.js";

const ProductService = new productManagerDB();
const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const limit = 5;
    const products = await productModel.find().limit(limit).lean();
    res.render("home", {
      title: "Backend / Final - Home",
      style: "styles.css",
      user: req.session.user,
      products: products,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/login", (req, res) => {
  res.render("login", {
    title: "Backend / Final - Login",
    style: "styles.css",
    message: req.session.messages ?? "",
  });
  delete req.session.messages;
  req.session.save();
});

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Backend / Final - Register",
    style: "styles.css",
    message: req.session.messages ?? "",
  });
  delete req.session.messages;
  req.session.save();
});

router.get("/products", auth, async (req, res) => {
  try {
    const { page = 1, limit = 8, sort } = req.query;
    //uso limit 8 solo por cuestiones esteticas para que funcione bien con mi frontEnd
    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true,
    };

    const searchQuery = {};

    if (req.query.category) {
      searchQuery.category = req.query.category;
    }

    if (req.query.title) {
      searchQuery.title = { $regex: req.query.title, $options: "i" };
    }

    if (req.query.stock) {
      const stockNumber = parseInt(req.query.stock);
      if (!isNaN(stockNumber)) {
        searchQuery.stock = stockNumber;
      }
    }

    if (sort === "asc" || sort === "desc") {
      options.sort = { price: sort === "asc" ? 1 : -1 };
    }

    const buildLinks = (products) => {
      const { prevPage, nextPage } = products;
      const baseUrl = req.originalUrl.split("?")[0];
      const sortParam = sort ? `&sort=${sort}` : "";

      const prevLink = prevPage
        ? `${baseUrl}?page=${prevPage}${sortParam}`
        : null;
      const nextLink = nextPage
        ? `${baseUrl}?page=${nextPage}${sortParam}`
        : null;

      return {
        prevPage: prevPage ? parseInt(prevPage) : null,
        nextPage: nextPage ? parseInt(nextPage) : null,
        prevLink,
        nextLink,
      };
    };

    const products = await ProductService.getPaginateProducts(
      searchQuery,
      options
    );
    const { prevPage, nextPage, prevLink, nextLink } = buildLinks(products);
    const categories = await productModel.distinct("category");

    let requestedPage = parseInt(page);
    if (isNaN(requestedPage) || requestedPage < 1) {
      requestedPage = 1;
    }

    if (requestedPage > products.totalPages) {
      return res.render("error", {
        title: "Backend / Final - Products",
        style: "styles.css",
        error: "/products",
      });
    }

    const response = {
      title: "Backend / Final - Products",
      style: "styles.css",
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      page: parseInt(page),
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevPage,
      nextPage,
      prevLink,
      nextLink,
      categories: categories,
      user: req.session.user,
    };

    return res.render("products", response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/realtimeproducts", auth, async (req, res) =>
  res.render("realTimeProducts", {
    products: await ProductService.getAllProducts(),
    style: "styles.css",
    user: req.session.user,
  })
);

router.get("/chat", auth, async (req, res) =>
  res.render("chat", {
    style: "styles.css",
    user: req.session.user,
  })
);

router.get("/cart/:cid", auth, async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findOne({ _id: cid }).lean();
    if (!cart) {
      return res.status(404).json({ error: "No se encontró el carrito" });
    }
    const products = await Promise.all(
      cart.products.map(async (product) => {
        const productData = await productModel
          .findOne({ _id: product._id })
          .lean();
        return { ...product, product: productData };
      })
    );
    res.render("cart", {
      title: "Backend / Final - cart",
      style: "styles.css",
      payload: products,
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/products/item/:pid", auth, async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findOne({ _id: pid }).lean();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.render("product-details", {
      title: "Detalles del Producto",
      style: "styles.css",
      product: product,
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al destruir la sesión:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } else {
      res.redirect("/login");
    }
  });
});

export default router;