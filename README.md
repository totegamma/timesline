# timesline

タイムズラインはスラックの分報チャンネルをTwitterのように一箇所に集めて表示できるアプリケーションです。

Electron + Reactで作られています

<img height="500px" alt="スクリーンショット 2022-05-05 20 48 58" src="https://user-images.githubusercontent.com/7270849/167250160-f1749671-002d-41e2-857b-cb8891ac68b2.png">


## Build
### 前準備
slackappを新しく作成しワークスペースにインストールする必要があります。
特に要求コープはありませんが、スコープがまったくないとインストールすることができないので、適当に弱そうなのをつけてあげてください。

また、oauthのコールバックを設定します。
私は独自のエンドポイント
```
https://s3.gammalab.net/slack_oauth_callback/
```
を開発し用いています。お試し程度に使っていただいても結構ですが、予告なしに内容の変更・削除を行う可能性があります。

作成したslackappのclient_idとclient_secretを、プロジェクトのルートに.envファイルを作成し記述します。

#### .env
```
slack_client_id='<your slack app client id>'
slack_client_secret='<your slack app client secret>'
```

あとnode_modulesのインストールをお忘れなく
```
npm i
```

### 開発用ビルド
```
npm run dev
```

### パッケージ化
```
npm run build
electron-builder --mac --x64 --dir # example for mac
```

