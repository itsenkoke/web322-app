/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Huan-Cheng Ke____________ Student ID: 151635224______ Date: 2024-07-29_________
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

// Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});

app.get('/shop', async (req, res) => {
    let viewData = {};
    try {
        let items = await itemData.getPublishedItems();
        viewData.items = items;
    } catch (err) {
        viewData.message = "no results";
    }
    res.render("shop", { data: viewData });
});

// Initialize and start server
itemData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("Unable to start server: " + err);
    });

module.exports = app;
