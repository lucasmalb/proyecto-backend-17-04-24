export const auth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }else{
        const email = req.body.email;
        const password = req.body.password;
        console.log(email, password)
        if (email == "adminCoder@coder.com" && password == "adminCod3r123") {
            req.session.failLogin = false;
            req.session.admin = true;
        }else{
            req.session.admin = false;
        }
    }
    next();
}