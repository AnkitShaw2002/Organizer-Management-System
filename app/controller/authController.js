const userModel = require('../model/userModel');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');


class AuthEjsController {

    async registerView(req, res) {
        res.render('register');
    }

    async registerCreate(req, res) {
        try {
            const { name, email, role, password } = req.body;

            if (!name || !email || !password) {
                return res.redirect('/auth/register');
            }

            const existingUser = await userModel.findOne({ email: email });
            if (existingUser) {
                return res.redirect('/auth/register');
            }

            const salt = await bcryptjs.genSalt(10);
            const hasPassword = await bcryptjs.hash(password, salt);

            const userData = new userModel({
                name,
                email,
                password: hasPassword,
                role: role === 'organizer' ? 'organizer' : 'attendee'
            });
            await userData.save();
            return res.redirect('/auth/login');

        } catch (error) {
            console.log(error);
            return res.redirect('/auth/register');
        }
    }


    async LoginView(req, res) {
        res.render('login');
    }

    async LoginCreate(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userModel.findOne({ email: email });

            if (!user) {
                return res.redirect('/auth/login');
            }

            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                return res.redirect('/auth/login');
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "1h" }
            );

            res.cookie('token', token);

            return res.redirect(`/${user.role}/dashboard`);

        } catch (error) {
            console.log(error);
            return res.status(500).send("Internal Server Error");
        }
    }

    async logout(req, res) {
        res.clearCookie('token');
        res.redirect('/auth/login');
    }
}


module.exports = new AuthEjsController();
