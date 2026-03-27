const jwt = require("jsonwebtoken")

const CheckAuth = (req, res, next) => {
    if (req.cookies && req.cookies.token) {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY, (err, data) => {
            if (err) {
                res.clearCookie('token');
                return res.redirect('/auth/login');
            }
            req.user = data;
            console.log(req.user);
            next();
        });
    } else {
        return res.redirect('/auth/login');
    }
};

module.exports = CheckAuth;
