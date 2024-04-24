import { Router } from "express";
import userModel from "../dao/models/userModel.js";
import { auth } from "../middleware/middleware.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    req.session.failRegister = false;
    await userModel.create(req.body);
    res.redirect("/login");
  } catch (e) {
    console.log(e.message);
    req.session.failRegister = true;
    res.redirect("/register");
  }
});

router.post("/login", auth, async (req, res) => {
  try {
    req.session.failLogin = false;

    // Check if user exists with provided email
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      req.session.failLogin = true;
      return res.redirect("/login");
    }

    // Compare provided password with stored hash
    if (!user.comparePassword(req.body.password)) {
      req.session.failLogin = true;
      return res.redirect("/login");
    }

    // Successful login, set session data
    delete user.password; // Remove password from response
    req.session.user = user;

    // Check if user is an admin
    if (user.email === "adminCoder@coder.com") {
      req.session.admin = true;
    } else {
      req.session.admin = false;
    }

    res.redirect("/");
  } catch (e) {
    console.log(e.message);
    req.session.failLogin = true;
    res.redirect("/login");
  }
});

export default router;