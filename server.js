const express = require('express');
const path = require('path');
const storeService = require('./store-server');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { addItem, items } = require('./store-server');

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

app.get('/', (req, res) => {
    res.redirect('/about'); // redirect the user to the /about route
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/about.html')); // must return the about.html file from the views folder
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
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

app.get('/items', (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(category)
            .then(items => {
                res.json(items);
            })
            .catch(err => {
                res.status(500).json({ message: err });
            });
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then(items => {
                res.json(items);
            })
            .catch(err => {
                res.status(500).json({ message: err });
            });
    } else {
        storeService.getAllItems()
            .then(items => {
                res.json(items);
            })
            .catch(err => {
                res.status(500).json({ message: err });
            });
    }
});

app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then(item => {
            res.json(item);
        })
        .catch(err => {
            res.status(500).json({ message: err });
        });
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
    .then(categories => {
        res.json(categories); // send data to the client
    })
    .catch(err => {
        res.status(500).json({ message: err });
    });
});

app.post('/items/add', upload.single("itemImage"), (req, res) => {
    console.log("Received request to add item");

    if(req.file){
        console.log("File received:", req.file);
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
            try {
                let result = await streamUpload(req);
                console.log("Uploaded to Cloudinary:", result); // so I can easily know if upload successfully or not
                return result;
            }
            catch(error){
                console.error("Error uploading to Cloudinary:", error);
                throw error;
            }
        }

        upload(req).then(((uploaded)=>{
            processItem(uploaded.url);
        })).catch((error) => {
            console.error("Error during upload:", error);
            res.status(500).send(error);
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl){
        const itemData = {
            id: items.length + 1,
            category: parseInt(req.body.category),// confirm the price will be double
            postDate: req.body.postDate,
            featureImage: imageUrl,
            price: parseFloat(req.body.price),// convert the categories to number
            title: req.body.title,
            body: req.body.body,
            published: req.body.published === 'true'
        };

        // Call the addItem function here
        addItem(itemData).then((item) => {
            console.log("Added Item:", item);
            res.redirect('/items');
        }).catch((err) => {
            console.error("Error adding item:", err);
            res.status(500).send(err);
        });
    }
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

module.exports = app;
