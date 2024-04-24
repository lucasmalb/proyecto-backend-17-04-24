export const auth = function (req, res, next) {
    const {user, password} = req.body;
    
     //Veo si hay un admincoder user.
    if (user === "admincoder@coder.com" && password === "adminCod3r123") {
        req.session.user = user;
        req.session.admin = true;
        const adminUser = {
            user: "admincoder@coder.com",
            role: "admin"
        }

        req.session.user = adminUser;
        return res.redirect("/home");
    } else {
        return next();
    }
}