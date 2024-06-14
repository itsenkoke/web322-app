const storeService = require('./store-service');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

// parse these files to js object
const items = JSON.parse(fs.readFileSync('./data/items.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('./data/categories.json', 'utf8'));

app.get('/', (req, res) => {
    res.redirect('/about'); // redirect the user to the /about route
});

app.get('/about', (req, res) => {
    res.redirect('/about'); // must return the about.html file from the views folder
});

// set a route called /shop, activate when user call
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
    .then(publishedItems => {
        res.json(publishedItems);
    })
    .catch(err => {
        res.status(500).json({ message: err });
    });
});

// same
app.get('/items', (req, res) => {
    storeService.getAllItems()
    .then(items => {
        res.json(items);
    })
    .catch(err => {
        res.status(500).json({ message: err });
    });
});

// same
app.get('/categories', (req, res) => {
    storeService.getAllCategories()
    .then(categories => {
        res.json(categories); // send data to the client
    })
    .catch(err => {
        res.status(500).json({ message: err });
    });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// initialize storeService and start the server
storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`); // output port to the console
        });
    })
    .catch(err => {
        console.error(`Failed to initialize store service: ${err}`);
    });