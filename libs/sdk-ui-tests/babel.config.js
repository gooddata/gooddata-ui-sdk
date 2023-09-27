// (C) 2023 GoodData Corporation
module.exports = {
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: ["@babel/plugin-proposal-export-default-from", "@babel/plugin-transform-typescript"],
    env: {
        test: {
            plugins: ["require-context-hook"],
        },
    },
};
