// const path = require('path');

// module.exports = {
//   entry: './src/index.js',
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'main.js',
//   },
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env', '@babel/preset-react'],
//           },
//         },
//       },
//     ],
//   },
//   resolve: {
//     extensions: ['.js', '.jsx'],
//   },
//   mode: 'production', // Change to 'development' during development
// };



const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/wp-content/plugins/audiomixer/dist/', // Adjust this path if necessary
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/, // Regex to match CSS files
        use: ['style-loader', 'css-loader'], // Loaders to handle CSS files
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  mode: 'development', // Set to 'development' for development mode
  devtool: 'source-map', // Optional: generate source maps for debugging
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true,
    publicPath: '/wp-content/plugins/audiomixer/dist/', // Adjust if needed
  },
};
