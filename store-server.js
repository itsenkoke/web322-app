const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.MONGO_URI, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// declare Item module
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// declare Category module
const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// set the relationship
Item.belongsTo(Category, {foreignKey: 'category'});

module.exports = {
    initialize,
    getAllItems,
    getCategories,
    getPublishedItems,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    getPublishedItemsByCategory,
    addCategory,
    deleteCategoryById,
    deleteItemById
};

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject("unable to sync the database: " + err));
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;
        for (let prop in itemData) {
            if (itemData[prop] === "") itemData[prop] = null;
        }
        itemData.itemDate = new Date();

        Item.create(itemData)
            .then(() => resolve())
            .catch(err => reject("unable to create item: " + err));
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { category: category } })
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

function getItemsByMinDate(minDateStr) {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                itemDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { id: id } })
            .then(data => resolve(data[0]))
            .catch(err => reject("no results returned: " + err));
    });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true, category: category } })
            .then(data => resolve(data))
            .catch(err => reject("no results returned: " + err));
    });
}

function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        for (let prop in categoryData) {
            if (categoryData[prop] === "") categoryData[prop] = null;
        }

        Category.create(categoryData)
            .then(() => resolve())
            .catch(err => reject("unable to create category: " + err));
    });
}

// delete categories by id
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject("unable to delete category: " + err));
    });
}

// delete item by id
function deleteItemById(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({ where: { id: id } })
            .then(() => resolve())
            .catch(err => reject("unable to delete item: " + err));
    });
}
