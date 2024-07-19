/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Huan-Cheng Ke____________ Student ID: 151635224______ Date: 2024-07-16_________
*
*  Vercel Web App URL: __https://vercel.com/itsenkokes-projects/web322-app______
* 
*  GitHub Repository URL: _https://github.com/itsenkoke/web322-app______________
*
********************************************************************************/ 
const express = require('express');
const path = require('path');
const itemData = require('./store-server');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dow6g8ub6',
    api_key: '958482277833155',
    api_secret: 'Pb7Trna4pJxt3qjfCw8cQsKdlpg',
    secure: true
});

const upload = multer();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

const handlebars = exphbs.create({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li class="nav-item">' +
                '<a class="nav-link' + ((url == app.locals.activeRoute) ? ' active' : '') + '" href="' + url + '">' +
                options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context) {
            return new handlebars.handlebars.SafeString(context);
        }
    }
});

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

app.get('/', (req, res) => {
    res.redirect('/shop'); // redirect the user to the /shop route
});

app.get('/shop', async (req, res) => {
    let viewData = {};

    try {
        let items = [];
        if (req.query.category) {
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await itemData.getPublishedItems();
        }

        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        let item = items[0];

        viewData.items = items;
        viewData.item = item;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await itemData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {
    let viewData = {};

    try {
        let items = [];
        if (req.query.category) {
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await itemData.getPublishedItems();
        }

        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.items = items;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.item = await itemData.getItemById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await itemData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/items/add', (req, res) => {
    res.render('addItem');
});

app.get('/items', (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        itemData.getItemsByCategory(category)
            .then(items => {
                res.render('items', { items });
            })
            .catch(err => {
                res.render('items', { message: "no results" });
            });
    } else if (minDate) {
        itemData.getItemsByMinDate(minDate)
            .then(items => {
                res.render('items', { items });
            })
            .catch(err => {
                res.render('items', { message: "no results" });
            });
    } else {
        itemData.getAllItems()
            .then(items => {
                res.render('items', { items });
            })
            .catch(err => {
                res.render('items', { message: "no results" });
            });
    }
});

app.post('/items/add', upload.single("itemImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.error("Error during upload:", error);
            res.status(500).send(error);
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl){
        const itemData = {
            id: items.length + 1,
            category: parseInt(req.body.category),
            postDate: req.body.postDate,
            featureImage: imageUrl,
            price: parseFloat(req.body.price),
            title: req.body.title,
            body: req.body.body,
            published: req.body.published === 'true'
        };

        addItem(itemData).then((item) => {
            res.redirect('/items');
        }).catch((err) => {
            console.error("Error adding item:", err);
            res.status(500).send(err);
        });
    }
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Failed to initialize store service: ${err}`);
    });

module.exports = app;
