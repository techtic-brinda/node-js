const toLowerCase = (item) => {
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            const upper = key.toLowerCase();
            if (upper !== key) {
                item[upper] = item[key];
                delete item[key];
            }
        }
    }
    return item;
};

module.exports = {
    data: function() {
        var data = [];
        return require('./dumps/COUNTRIES_201905081635').COUNTRIES.map(c => {
            var obj = {};
            obj["name"] = c.NAME_EN;
            obj["numeric_code"] = c.NUMERIC_CODE;
            data.push(obj);
        });
    }
};
// var data = [];
// const countries = require('./dumps/COUNTRIES_201905081635').COUNTRIES.map(toLowerCase).map(c => {
//     var obj = {};
//     obj["name"] = c.NAME_EN;
//     obj["numeric_code"] = c.NUMERIC_CODE;
//     data.push(obj);
// });

// export data;