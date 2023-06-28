// (C) 2019 GoodData Corporation

const path = require("path");
const fs = require("fs");
const url = require("postcss-url");

const currentModuleName = require("./package.json").name;
const currentModuleUrlRegExp = new RegExp(`~${currentModuleName}`);
const options = [
    {
        filter: currentModuleUrlRegExp,
        url: (asset) => {
            const relativePath = path.relative(path.resolve(currentModuleName), "./");
            return asset.originUrl.replace(currentModuleUrlRegExp, relativePath);
        },
    },
    {
        filter: /~@gooddata/,
        url: (asset, dir) => {
            const module = asset.originUrl.match(/~(@gooddata\/[^/]+)/)[1];
            const urlPath = asset.pathname;
            const npmPath = urlPath.replace(`~${module}`, `node_modules/${module}`);
            const newPath = urlPath.replace(
                `~${module}`,
                `${process.cwd()}/styles/css-inlined/deps/${module}`,
            );

            const realPath = path.resolve(npmPath);
            if (!fs.existsSync(realPath)) {
                throw new Error(`Asset ${asset.originUrl} does not exist`);
            }

            if (!fs.existsSync(newPath)) {
                ensureDirectoryExistence(newPath);
                fs.copyFileSync(realPath, newPath);
            }

            const relativePath = "./" + path.relative(dir.to, `${process.cwd()}/styles/css-inlined/deps`);
            return asset.originUrl.replace(`~${module}`, `${relativePath}/${module}`);
        },
    },
];

module.exports = {
    plugins: [url(options)],
};

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
