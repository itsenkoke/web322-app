/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Huan-Cheng Ke
Student ID: 151635224
Date: 24-06-13
Vercel Web App URL: 
GitHub Repository URL: 

********************************************************************************/

const express = require('express');
const path = require('path');
const storeService = require('./store-server');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about'); // redirect the user to the /about route
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/about.html')); // must return the about.html file from the views folder
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

// default route setting
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname + '/views/404.html'));
});

// initialize storeService and start the server
storeService.initialize()
    .then(() => {
        const port = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`); // output port to the console
        });
    })
    .catch(err => {
        console.error(`Failed to initialize store service: ${err}`);
    });

module.exports = app;