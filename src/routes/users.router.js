import { Router } from "express";
// import userModel from "../dao/models/userModel.js";
import { userService } from "../services/userService.js";
import { createHash, isValidPassword } from "../utils/functionsUtil.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    req.session.failRegister = false;
    console.log(req.body);
    const existingUser = await userService.getUserByEmail(email);
    console.log(existingUser);
    if (existingUser) {
      req.session.failRegister = true;
      req.session.failReason = "El correo electrónico ya está en uso.";
      res.redirect("/register");
      return;
    }
    const newUser = {
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      role: "user",
    };
    await userService.createUser(newUser);
    res.redirect("/login?successRegister=true");
  } catch (error) {
    console.log(error.message);
    req.session.failRegister = true;
    req.session.failReason = "Error al registrar el usuario.";
    res.redirect("/register");
  }
});

router.post("/login", async (req, res) => {
  try {
    req.session.failLogin = false;
    const { email, password, remember } = req.body;
    if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
      const adminUser = {
        first_name: "admin",
        last_name: "Coder",
        email: "adminCoder@coder.com",
        age: 30,
        role: "admin",
      };
      req.session.user = adminUser;
      return res.redirect("/products");
    }

    const result = await userService.getUserByEmail(email);
    console.log("result:", result);
    if (!result) {
      req.session.failLogin = true;
      return res.redirect("/login");
    }

    if (!isValidPassword(result, password)) {
      req.session.failLogin = true;
      return res.redirect("/login");
    }

    if (remember) {
      console.log("Recordar credenciales por 7 dias");
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // 7 días
    }

    delete result.password;
    req.session.user = result;

    return res.redirect("/products");
  } catch (e) {
    req.session.failLogin = true;
    return res.redirect("/login");
  }
});

export default router;