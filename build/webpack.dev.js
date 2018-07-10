const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin') // 通过 npm 安装
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const webpack = require('webpack') // 用于访问内置插件

const INCLUDE_PATHS = path.resolve(__dirname, '../src/core')

const config = {
  mode: 'development',
  // mode: 'production',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    // compress: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'nested',
                includePaths: [INCLUDE_PATHS]
              }
            }
          ],
          fallback: 'style-loader' // use style-loader extract css file
        })
      },
      {
        test: /(\.png)|(\.jpg)|(\.jpeg)|(\.gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 7000,
            name: '/staticimg/[name].[hash:7].[ext]'
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'initial', // 只对入口文件处理
      cacheGroups: {
        vendor: {
          // split `node_modules`目录下被打包的代码到 `page/vendor.js && .css` 没找到可打包文件的话，则没有。css需要依赖 `ExtractTextPlugin`
          test: /node_modules\//,
          name: 'assets/vendor',
          priority: 10,
          enforce: true
        },
        commons: {
          // split `common`和`components`目录下被打包的代码到`page/commons.js && .css`
          test: /common\/|components\//,
          name: 'assets/commons',
          priority: 10,
          enforce: true
        }
      }
    },
    runtimeChunk: {
      name: 'assets/manifest'
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      chunks: ['index', 'assets/manifest', 'assets/vendor', 'assets/commons'],
      template: 'src/index.html'
    })
    // new HtmlWebpackPlugin({
    //   filename: 'test.html',
    //   template: 'src/assets/test.html'
    // })
  ],
  entry: {
    index: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '',
    // filename: '[name].[chunkhash].js',
    // chunkFilename: 'chunk.[chunkhash].js'
    filename: '[name].js',
    chunkFilename: '[name].js'
  }
}

module.exports = config
