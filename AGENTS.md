# threejs-narration-reel キット

ナレーション付きの縦型解説リール（1080×1920、Three.js + Remotion）を作るためのフォルダ。

- リールの依頼（「〇〇の雑学をThree.jsで」「ナレーション付きのリールを作って」など）では、作業の前に `skill/threejs-narration-reel/SKILL.md` を読み、その手順どおりに進める。
- 初めて使うときの準備は `README.md`。
- 完成例は `projects/<name>/`（台本・タイミング・計画）と `remotion-composer/src/<slug>/`（シーン）。必要になった例だけを開く。フォルダ全体を一度に読まない。
- 静止画と書き出し（headless の Chromium）はサンドボックスの中では起動しない。サンドボックスの外で実行する。
- API キーは `.env` か環境変数に置く。中身を表示しない。

## 使う人が決めること

<!-- ElevenLabs のクレジット消費と mp3 のダウンロードを、毎回確認せずに進めてよいかを書く。例:
「スキルを呼んだ時点で、そのリールの台本分の ElevenLabs 生成と、elevenlabs.io からの mp3 のダウンロードを許可する」 -->
