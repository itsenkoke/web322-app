const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

function addItem(itemData) {
    itemData.id = items.length + 1;
    return new Promise((resolve, reject) => {
        if (!itemData.title || !itemData.body || !itemData.category || !itemData.price) {
            reject("All fields are required");
        } else {
            itemData.id = items.length + 1;
            itemData.published = (itemData.published === 'true');
            itemData.itemDate = new Date().toISOString().split('T')[0];

            items.push(itemData);
            resolve(itemData);
        }
    });
}

function initialize(){
    return new Promise((fulfilled, rejected) => {
        try {
            const itemData = fs.readFileSync(path.join(__dirname, 'data', 'items.json'), 'utf8');
            items = JSON.parse(itemData);

            const categoriesData = fs.readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf8');
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

function getItemsByCategory(category) { // part 3,4 instruction required function
    return new Promise((fulfilled, rejected) => {
        const filteredItems = items.filter(item => item.category === parseInt(category));
        if (filteredItems.length > 0) {
            fulfilled(filteredItems);
        } else {
            rejected(`No items found for category ${category}`);
        }
    });
}

function getItemsByMinDate(minDateStr) { // instruction required function
    return new Promise((fulfilled, rejected) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            fulfilled(filteredItems);
        } else {
            rejected(`No items found from date ${minDateStr}`);
        }
    });
}

function getItemById(id) { // instruction required function
    return new Promise((fulfilled, rejected) => {
        const item = items.find(item => item.id === parseInt(id));
        if (item) {
            fulfilled(item);
        } else {
            rejected(`No item found with id ${id}`);
        }
    });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true && item.category == category);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No published items found for category: " + category);
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getCategories,
    getPublishedItems,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    items,
    getPublishedItemsByCategory
};