const webpack = require('webpack');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const workboxPlugin = require('workbox-webpack-plugin');

module.exports = env => {
	var use_zakklab = (env && env.ZAKKLAB) ? env.ZAKKLAB : 0;

	return {
		entry: './src/app.js',
		performance: {
			hints: false,
			maxEntrypointSize: 2*512000,
			maxAssetSize: 2*512000
		},
		output: {
			path: path.resolve(__dirname, 'build'),
			filename: 'app-[fullhash].js',
			assetModuleFilename: 'r-[hash][ext]',
			clean: true
		},
		module: {rules: [{oneOf: [
			{
				resourceQuery: /pure/,
				type: 'asset/resource',
				generator: { filename: '[name][ext]' }
			},{
				resourceQuery: /inline/,
				type: 'asset/inline'
			},{
				test: /app\.manifest$/,
				type: 'asset/resource',
				generator: { filename: 'manifest.json' },
				use: [
					{ loader: path.resolve('./src/loader/twig-loader.js'), options: { zakklab:use_zakklab } }
				]
			},{
				test: /\.twig$/,
				use: [
					{loader: 'html-loader', options: { esModule: false, sources: {list: [{tag:'img',attribute:'src',type:'src'}] } }},
					{loader: path.resolve('./src/loader/twig-loader.js'), options: {zakklab:use_zakklab,loadpages:true}}
				]
			},{
				test: /\.scss$/,
				use: [
					{loader: MiniCssExtractPlugin.loader},
					{loader: 'css-loader'},
					{loader: 'resolve-url-loader'},
					{loader: 'sass-loader', options: { implementation: require('sass'), sourceMap: true }}
				]
			},{
				test: /\.(trail|mapmarks)$/,
				//type: 'asset/inline',
				use: path.resolve('./src/loader/yaml-loader.js')
			},{
				test: /\.(png|svg|jpe?g|gif|woff2?|ttf|eot)$/,
				type: 'asset/resource',
			}
		]}]},
		plugins: [
			new webpack.ProvidePlugin({L:'leaflet'}),
			new webpack.DefinePlugin({
				'ADD_ZAKKLAB': use_zakklab
			}),
			new MiniCssExtractPlugin({filename: 'app-[fullhash].css'}),
			new HtmlWebpackPlugin({
				title: 'Valdese Lakeside Park',
				template: 'src/index.twig'
			}),
			new CompressionPlugin({
				test: /\.(css|js|html)$/i,
			}),
			new workboxPlugin.GenerateSW({
				swDest: 'sw.js',
				maximumFileSizeToCacheInBytes: 3000000,
				//globPatterns: ['**/*.{html,js,css}'],
				cleanupOutdatedCaches: true,
				exclude: [/\.(css|js|html)\.gz/],
				clientsClaim: true,
				skipWaiting: true,
				runtimeCaching: [{
					urlPattern: new RegExp('https://[a-c].tile.openstreetmap.org/[0-9]+/[0-9]+/[0-9]+.png'),
					handler: 'StaleWhileRevalidate',
					options: {
						cacheName: 'map-tiles',
						// limit number of tiles in cache; should be enough for common offline use
						expiration: { maxEntries: 900 },
					},
				}]
			})
		]
	}
}
