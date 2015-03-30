// Copyright (C) 2007-2015, GoodData(R) Corporation. All rights reserved.
var webpack = require("webpack");
module.exports = {
    entry: './src/gooddata.js',
    output: {
        filename: './dist/gooddata.js',
        // export itself to a global var
        libraryTarget: "umd",
        // name of the global var
        library: "gooddata"
    },
    plugins: [
        new webpack.BannerPlugin('<%= licence %>', {raw: true})
    ],
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        "jquery": "jQuery"
    }
};

