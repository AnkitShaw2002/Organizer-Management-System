const roleChecker = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/auth/login');
        }

        console.log("User role:", req.user.role);
        console.log("Required role:", requiredRole);

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ status: false, message: 'Access denied' });
        }

        next();
    };
};

module.exports = roleChecker;
