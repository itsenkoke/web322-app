const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

function initialize(){
    return new Promise((fulfilled, rejected) => {
        try {
            const itemDate = fs.readFileSync(path.join(__dirname, 'data', 'items.json'), 'utf8');
            items = JSON.parse(itemData);

            const categories = fs.readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf8');
            categories = JSON.parse(categoriesData);

            fulfilled();
        }catch (err){
            rejected('Unable to load data: ' + err);
        }
    })
}

function getAllItems() {
    return new Promise((fulfilled, rejected) => {
        if (items.length > 0) {
            fulfilled(items);
        } else {
            rejected("No items found");
        }
    });
}

function getCategories() {
    return new Promise((fulfilled, rejected) => {
        if (categories.length > 0) {
            fulfilled(categories);
        } else {
            rejected("No categories found");
        }
    });
}

function getPublishedItems() {
    return new Promise((fulfilled, rejected) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            fulfilled(publishedItems);
        } else {
            rejected("No published items found");
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getCategories,
    getPublishedItems
};