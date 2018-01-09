const path = require('path');
const webpack = require('webpack');

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

module.exports = (storybookBaseConfig, configType) => {
    storybookBaseConfig.resolve.extensions = ['.ts', '.tsx', '.js', '.json'];

    storybookBaseConfig.module.rules = [
        {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader']
        },
        {
            test: /.scss$/,
            loaders: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
            test: /\.(eot|woff|ttf|svg)/,
            loader: 'file-loader'
        },
        {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            include: [
                path.join(__dirname, '../stories'),
                path.join(__dirname, '../src')
            ],
            loaders: ['ts-loader']
        }
    ];

    storybookBaseConfig.plugins.push(
        new webpack.DefinePlugin({
            __COMMIT_HASH__: JSON.stringify(commitHash),
        })
    );

    if (configType === 'PRODUCTION') {
        // see https://github.com/storybooks/storybook/issues/1570
        storybookBaseConfig.plugins = storybookBaseConfig.plugins.filter(
            plugin => plugin.constructor.name !== 'UglifyJsPlugin'
        );
    }

    return storybookBaseConfig;
};
