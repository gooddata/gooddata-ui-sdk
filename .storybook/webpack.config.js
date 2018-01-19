const path = require('path');
const webpack = require('webpack');

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

module.exports = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
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
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
          __COMMIT_HASH__: JSON.stringify(commitHash),
        })
    ]
};
