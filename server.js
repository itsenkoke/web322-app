/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Huan-Cheng Ke____________ Student ID: 151635224______ Date: 2024-08-04_________
*
*  Vercel Web App URL: __https://vercel.com/itsenkokes-projects/web322-app______
* 
*  GitHub Repository URL: _https://github.com/itsenkoke/web322-app______________
*
********************************************************************************/
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const handlebarsLayouts = require('handlebars-layouts');
const itemData = require('./store-server');
const app = express();
const authData = require('./auth-service');
const clientSessions = require("client-sessions");
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 8080;

// Handlebars configuration
const hbs = exphbs.create({
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        formatDate: function(dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
});

handlebarsLayouts.register(hbs.handlebars);

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(clientSessions({
    cookieName: "session",
    secret: "Woa^b?>ei(&AdKH",
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/shop', ensureLogin, async (req, res) => {
    let viewData = {};
    try {
        let items = await itemData.getPublishedItems();
        viewData.items = items;
    } catch (err) {
        viewData.message = "no results";
    }
    res.render("shop", { data: viewData });
});

// Define the route for /about
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});


app.get("/items", ensureLogin, async (req, res) => {
    try {
        let items = await itemData.getItems();
        res.render('items', { items: items });
    } catch (err) {
        res.render('items', { message: "no results" });
    }
});

app.get("/items/add", ensureLogin, (req, res) => {
    res.render('addItem');
});

app.post("/items/add", ensureLogin, async (req, res) => {
    try {
        await itemData.addItem(req.body);
        res.redirect('/items');
    } catch (err) {
        res.status(500).send("Unable to add item");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render("register", { successMessage: "User created" });
    }).catch((err) => {
        res.render("register", { errorMessage: err, userName: req.body.userName });
    });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/items');
    }).catch((err) => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

function ensureLogin(req, res, next) {
    if (!req.session.userName) {
        res.redirect("/login");
    } else {
        next();
    }
}

authData.initialize()
    .then(() => {
        console.log("Database connection successful");
    })
    .catch((err) => {
        console.log("Database connection error: " + err);
    });

// Initialize and start server
itemData.initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("Unable to start server: " + err);
    });


module.exports = app;
