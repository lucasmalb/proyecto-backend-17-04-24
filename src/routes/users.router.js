import { Router } from "express";
import passport from "passport";

const router = Router();

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  (req, res) => {
    res.send({
      status: "success",
      message: "Success",
    });
  }
);

router.get(
  "/githubcallback",
  passport.authenticate("github", {
    failureMessage: true,
    failureRedirect: "/login?failLogin=true",
  }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/products");
  }
);

router.post(
  "/register",
  passport.authenticate("register", {
    failureMessage: true,
    failureRedirect: "/register?failRegister=true",
  }),
  (req, res) => {
    res.send({
      status: "success",
      message: "Usuario registrado",
    });
  }
);

router.post(
  "/login",
  passport.authenticate("login", {
    failureMessage: true,
    failureRedirect: "/login?failLogin=true",
  }),
  (req, res) => {
    if (!req.user) {
      return res.send(401).send({
        status: "error",
        message: "Error Login!",
      });
    }

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
      role: req.user.role,
    };
    res.redirect("/products");
  }
);

export default router;