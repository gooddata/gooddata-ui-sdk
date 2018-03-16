const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');

const title = require('./package.json').description;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const defaultBackend = process.env.CLIENT_DEMO_BACKEND || 'https://staging3.intgdc.com';

module.exports = ({ gdc = defaultBackend, link = false, basepath = '' } = {}) => {
    console.log('Backend: ', gdc); // eslint-disable-line no-console

    const isProduction = process.env.NODE_ENV === 'production';

    const proxy = {
        '/gdc': {
            target: gdc,
            secure: false,
            cookieDomainRewrite: '',
            onProxyReq: (proxyReq) => {
                if (proxyReq.method === 'DELETE' && !proxyReq.getHeader('content-length')) {
                    // Only set content-length to zero if not already specified
                    proxyReq.setHeader('content-length', '0');
                }

                // White labeled resources are based on host header
                proxyReq.setHeader('host', 'localhost:8999');
                proxyReq.setHeader('referer', gdc);
                proxyReq.setHeader('origin', null);
            }
        }
    };

    const resolve = {
        extensions: ['.js', '.jsx'],
        alias: link ? {
            react: path.resolve(__dirname, '../node_modules/react'),
            'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
            '@gooddata/react-components/styles': path.resolve(__dirname, '../styles/'),
            '@gooddata/react-components': path.resolve(__dirname, '../dist/')
        } : {}
    };

    const plugins = [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            title
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules|dist/,
            failOnError: true
        }),
        new webpack.DefinePlugin({
            GDC: JSON.stringify(gdc),
            BASEPATH: JSON.stringify(basepath),
            'process.env': {
                // This has effect on the react lib size
                NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development')
            }
        })
    ];

    if (process.env.NODE_ENV === 'production') {
        const uglifyOptions = {
            mangle: true,
            compress: {
                sequences: true,
                dead_code: true,
                drop_debugger: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true,
                warnings: false
            }
        };

        plugins.push(
            new webpack.optimize.OccurrenceOrderPlugin(),

            new webpack.optimize.ModuleConcatenationPlugin(),

            new UglifyJsPlugin({
                uglifyOptions,
                parallel: true
            }),
            new CompressionPlugin({
                asset: '[file].gz',
                algorithm: 'gzip'
            }),
            function collectStats() {
                this.plugin('done', (stats) => {
                    const filename = path.join(__dirname, 'dist', 'stats.json');
                    const serializedStats = JSON.stringify(stats.toJson(), null, '\t');
                    require('fs').writeFileSync(filename, serializedStats);
                });
            }
        );
    }

    return {
        entry: ['./src/index.jsx'],
        plugins,
        output: {
            filename: '[name].[hash].js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: `${basepath}/`
        },
        devtool: isProduction ? false : 'cheap-module-eval-source-map',
        node: {
            __filename: true
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
                    test: /\.jsx?$/,
                    exclude: /node_modules|update-dependencies/,
                    use: {
                        loader: 'babel-loader'
                    }
                },
                {
                    test: /\.(jpe?g|gif|png|svg|ico|eot|woff2?|ttf|wav|mp3)$/,
                    use: 'file-loader'
                }
            ]
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            historyApiFallback: true,
            compress: true,
            port: 8999,
            proxy
        },
        resolve
    };
};
