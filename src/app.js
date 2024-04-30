import express from "express";
import session from "express-session";
import mongoStore from "connect-mongo";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import usersRouter from "./routes/users.router.js";
import viewsRouter from "./routes/views.router.js";
import handlebars from "express-handlebars";
import __dirname from "./utils/constantsUtil.js";
import { Server } from "socket.io";
import Sockets from "./sockets.js";
import mongoose from "mongoose";
import passport from "passport";
import initializatePassport from "./config/passport.config.js";

const app = express();
const port = 8080;
const uri = "mongodb+srv://lma:Nelson1204@cluster0.9d6vkgf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    store: mongoStore.create({
      mongoUrl: uri,
      ttl: 60, // 60 minutos
    }),
    secret: "secretPhrase",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 1000 * 60 }, // 60 minutos en milisegundos
  })
);

initializatePassport();
app.use(passport.initialize());
app.use(passport.session());


app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", usersRouter);

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/../views");


mongoose
  .connect(uri, { dbName: "ecommerce" })
  .then(() => {
    console.log("Conexión exitosa a la base de datos");
    const server = app.listen(port, () =>
      console.log(`Servidor corriendo en http://localhost:${port}`)
    );

    const io = new Server(server);
    Sockets(io);
  })
  .catch((error) => {
    console.log("No se puede conectar con la DB: " + error);
    process.exit(1);
  });