import path from 'path';

/** エディタで補完を効かせるために型定義をインポート */
import { Configuration } from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const webpack = require('webpack');
//const dotenv = require('dotenv');
require('dotenv').config()

// 開発者モードか否かで処理を分岐する
const isDev = process.env.NODE_ENV === 'development';

// 共通設定
const common: Configuration = {
  // モード切替
  mode: isDev ? 'development' : 'production',
  // モジュール解決に参照するファイル拡張子
  resolve: {
   extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
   alias: {
       "path": "path-browserify",
   }
  },
  /**
   * macOS 上でのビルド失敗に対処するワークアラウンド
   * https://github.com/yan-foto/electron-reload/issues/71
   */
  externals: ['fsevents'],
  output: {
    // バンドルファイルの出力先（ここではプロジェクト直下の 'dist' ディレクトリ）
    path: path.resolve(__dirname, 'dist'),
    // webpack@5 + electron では必須の設定
    publicPath: './',
    /**
     * エントリーセクションでチャンク名を付けていれば
     * [name] へそのチャンク名が代入される
     */
    filename: '[name].js',
    // 画像などのアセット類は 'dist/assets' フォルダへ配置する
    assetModuleFilename: 'assets/[name][ext]',
  },
  module: {
    rules: [
      {
        /**
         * 拡張子 '.ts' または '.tsx' （正規表現）のファイルを 'ts-loader' で処理
         * ただし node_modules ディレクトリは除外する
         */
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        // 拡張子 '.css' （正規表現）のファイル
        test: /\.css$/,
        // use 配列に指定したローダーは *最後尾から* 順に適用される
        use: [
          // セキュリティ対策のため style-loader は使用しない
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      {
        // 画像やフォントなどのアセット類
        test: /\.(ico|png|jpe?g|svg|eot|woff?2?)$/,
        /**
         * アセット類も同様に asset/inline は使用しない
         * なお、webpack@5.x では file-loader or url-loader は不要になった
         */
        type: 'asset/resource',
      },
    ],
  },
  // 開発時には watch モードでファイルの変化を監視する
  watch: isDev,
  /**
   * development モードではソースマップを付ける
   *
   * なお、開発時のレンダラープロセスではソースマップがないと
   * electron のデベロッパーコンソールに 'Uncaught EvalError' が
   * 表示されてしまうことに注意
   */
  devtool: isDev ? 'inline-source-map' : undefined,
};

// メインプロセス向け設定
const main: Configuration = {
  // 共通設定を読み込み
  ...common,
  target: 'electron-main',
  // エントリーファイル（チャンク名は 'main'）
  entry: {
    main: './src/main.ts',
  },
};

// プリロードスクリプト向け設定
const preload: Configuration = {
  ...common,
  target: 'electron-preload',
  entry: {
    preload: './src/preload.ts',
  },
};

// レンダラープロセス向け設定
const renderer: Configuration = {
  ...common,
  // セキュリティ対策として 'electron-renderer' ターゲットは使用しない
  target: 'electron-main',
  entry: {
    app: './src/web/app.tsx',
  },
  plugins: [
    // CSS を JS へバンドルせず別ファイルとして出力するプラグイン
    new MiniCssExtractPlugin(),
    /**
     * バンドルしたJSファイルを <script></scrip> タグとして差し込んだ
     * HTMLファイルを出力するプラグイン
     */
    new HtmlWebpackPlugin({
      template: './src/web/index.html',
    }),

	new webpack.DefinePlugin({
		'process.env': JSON.stringify(process.env)
	})
  ],
};

// 開発時にはレンダラープロセスのみを処理する（メインプロセスは tsc で処理）
const config = isDev ? [renderer] : [main, preload, renderer];
export default config;

