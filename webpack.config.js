const webpack = require('webpack');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const workboxPlugin = require('workbox-webpack-plugin');

module.exports = env => {
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
			},{ // not needed in protomaps-leaflet ^1.24.2
				test: /protomaps-leaflet[\/\\]/,
				// this test was required in order to successfully bundle the protomaps-leaflet module with webpack
				resolve: { fullySpecified: false },
			},{
				test: /\.pmtiles$/,
				type: 'asset/resource',
			},{
				test: /app\.manifest$/,
				type: 'asset/resource',
				generator: { filename: 'manifest.json' },
				use: [
					{ loader: path.resolve('./src/loader/twig-loader.js'), options: { } }
				]
			},{
				test: /\.twig$/,
				use: [
					{loader: 'html-loader', options: { esModule: false, sources: {list: [{tag:'img',attribute:'src',type:'src'}] } }},
					{loader: path.resolve('./src/loader/twig-loader.js'), options: {loadpages:true}}
				]
			},{
				test: /\.css$/,
				use: [
					{loader: MiniCssExtractPlugin.loader},
					{loader: 'css-loader'}
				]
			},{
				test: /\.scss$/,
				use: [
					{loader: MiniCssExtractPlugin.loader},
					{loader: 'css-loader'},
					{loader: 'resolve-url-loader'},
					{loader: 'sass-loader', options: { api: "modern",implementation: require('sass'), sourceMap: true }}
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
				cleanupOutdatedCaches: true,
				exclude: [/\.(css|js|html)\.gz/],
				runtimeCaching: [{
					urlPattern: /https:\/\/my\.friendsofthevaldeserec\.org\/api\//,
					handler: 'NetworkFirst',
					options: {
						cacheName: 'my-fvr',
						expiration: { maxEntries: 16 },
					},
				}]				
			})
		]
	}
}
