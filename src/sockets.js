import { messageModel } from "./dao/models/messageModel.js";
import { productManagerDB } from "./dao/ProductManagerDB.js";
import { messageService } from "./services/messageService.js";
import  cartManagerDB  from "./dao/cartManagerDB.js";
const ProductService = new productManagerDB();
const CartService = new cartManagerDB();
let users = [];

export default (io) => {
  io.on("connection", async (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    // Manejo de productos
    const emitProducts = async () => {
      const products = await ProductService.getAllProducts();
      socket.emit("products", products);
    };

    const addProduct = async (product) => {
      try {
        await ProductService.createProduct(product);
        await emitProducts();
      } catch (error) {
        console.error("Error al crear producto:", error);
      }
    };

    const deleteProduct = async (pid) => {
      try {
        await ProductService.deleteProduct(pid);
        await emitProducts();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    };

    socket.on("createProduct", addProduct);
    socket.on("deleteProduct", deleteProduct);

    socket.on("message", async (data) => {
      await messageService.saveMessage(data);
      const messages = await messageModel.find().lean();
      io.emit("messagesLogs", messages);
    });

    socket.on("userConnect", async (data) => {
      users.push({ id: socket.id, name: data });
      socket.emit(`newUser`, `Bienvenido ${data}`);
      io.emit("updateUserList", users);
      const messages = await messageModel.find().lean();
      socket.emit("messagesLogs", messages);
      socket.broadcast.emit("newUser", `${data} se ha unido al chat`);
    });

    socket.on("joinChat", () => {
      io.emit("updateUserList", users);
    });

    socket.on("disconnect", () => {
      const user = users.find((user) => user.id === socket.id);
      if (user) {
        users = users.filter((user) => user.id !== socket.id);
        io.emit("updateUserList", users);
        socket.broadcast.emit(`newUser`, `${user.name} se ha ido del chat`);
      }
    });

    await emitProducts(); 
  });
};