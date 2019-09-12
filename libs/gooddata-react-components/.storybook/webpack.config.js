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
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(svg|eot|woff|ttf)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                include: [
                    path.join(__dirname, '../stories'),
                    path.join(__dirname, '../src')
                ],
                loaders: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            configFile: path.join(__dirname, '../stories/tsconfig.json')
                        },
                    }
                ]
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
          __COMMIT_HASH__: JSON.stringify(commitHash),
        })
    ]
};
