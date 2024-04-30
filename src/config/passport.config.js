import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { createHash, isValidPassword } from "../utils/functionsUtil.js";
import { userService } from "../services/userService.js";

const initializePassport = () => {
  const localStratergy = local.Strategy;
  const admin = {
    first_name: "Coder",
    last_name: "Admin",
    age: 0,
    email: "adminCoder@coder.com",
    password: "adminCod3r123",
    role: "admin",
  };

  const CLIENT_ID = "Iv1.295ee394a6b994a0";
  const SECRET_ID = "8de066a6a45ddf27113115e6a23b743c6d42b5b2";
  const githubCallbackURL = "http://localhost:8080/api/sessions/githubcallback";

  
  passport.use(
    "register",
    new localStratergy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age, role } = req.body;

        try {
          let user = await userService.getUserByEmail(username);
          if (user) {
            const errorMessage =
              "¡Registro fallido! El usuario ya existe en la base de datos\n Por favor, ingresá otro correo electrónico.";
            return done(null, false, errorMessage);
          }

          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: role || "user",
          };
          const result = await userService.createUser(newUser);

          return done(null, result);
        } catch (error) {
          return done(error.message);
        }
      }
    )
  );

  passport.use(
    "login",
    new localStratergy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          if (
            username === "adminCoder@coder.com" &&
            password === "adminCod3r123"
          ) {
            const adminUser = admin;
            return done(null, adminUser);
          }

          const user = await userService.getUserByEmail(username);
          if (!user) {
            const errorMessage =
              "¡Inicio de sesión fallido! El usuario no existe\n Por favor, verifica tu correo electrónico e intenta nuevamente.";
            return done(null, false, errorMessage);
          }

          if (!isValidPassword(user, password)) {
            const errorMessage =
              "¡Inicio de sesión fallido! La contraseña es incorrecta\n Por favor, verifica tu contraseña e intenta nuevamente.";
            return done(null, false, errorMessage);
          }

          return done(null, user);
        } catch (error) {
          return done(error.message);
        }
      }
    )
  );

  //Github
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: CLIENT_ID,
        clientSecret: SECRET_ID,
        callbackURL: githubCallbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile || !profile._json || !profile._json.email) {
            const errorMessage =
              "No se encontró un email asignado en github, por lo tanto no se podrá loguear\n Por favor, actualice su perfil de github con un email e intenta nuevamente.";
            return done(null, false, errorMessage);
          }
          const email = profile._json.email;

          let user = await userService.getUserByEmail(email);
          if (!user) {
            let newUser = {
              first_name: profile._json.login,
              last_name: " ",
              email: email,
              password: "",
              age: 0,
              role: "user",
            };
            let result = await userService.createUser(newUser);
            done(null, result);
          } else {
            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    if (user.email === admin.email) {
      done(null, "admin");
    } else {
      done(null, user._id);
    }
  });

  passport.deserializeUser(async (id, done) => {
    if (id === "admin") {
      done(null, admin);
    } else {
      let user = await userService.getUsersById(id);
      done(null, user);
    }
  });
};

export default initializePassport;