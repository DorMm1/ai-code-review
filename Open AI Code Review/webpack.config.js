const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'production',
	target: 'node',
	entry: path.resolve(__dirname, 'src/main.ts'),
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'main.js',
		libraryTarget: 'commonjs2'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: path.resolve(__dirname, 'src/task.json'), to: path.resolve(__dirname, 'dist') },
				{ from: path.resolve(__dirname, 'src/icon.png'), to: path.resolve(__dirname, 'dist') }
			]
		})
	],
	experiments: {
		topLevelAwait: true
	}
};
