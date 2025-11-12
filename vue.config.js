const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0', // すべてのIPアドレスにバインド
    port: 8080, // サーバーのポート
    open: false, // 自動でブラウザを開かない
    allowedHosts: 'all', // 他のホストからのアクセスを許可

    // ✅ ここを追加！
    client: {
      overlay: false, // ← これで赤いエラーパネル（overlay）を完全OFF
    },
  },

  chainWebpack: (config) => {
    config.plugin('copy').tap(([options]) => {
      options.patterns.push({
        from: path.resolve(__dirname, '_redirects'), // プロジェクトのルートから_redirectsを取得
        to: path.resolve(__dirname, 'dist'), // distフォルダにコピー
        toType: 'dir',
      });
      return [options];
    });
  },
});
