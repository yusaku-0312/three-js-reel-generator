# threejs-narration-reel キット

ナレーション付きの縦型解説リールを Three.js で作るスキルと、その実行に必要なスクリプト・部品・完成例をまとめたフォルダです。手順の本体は `skill/threejs-narration-reel/SKILL.md` にあります。

## 中身

| パス | 内容 |
|---|---|
| `AGENTS.md` | エージェントが最初に読む短い案内 |
| `skill/threejs-narration-reel/SKILL.md` | スキル本体（台本の設計、音声生成、アニメーション計画、書き出し、これまでの教訓） |
| `scripts/narration_reel/` | 台本 → 音声 → タイミング → Remotion のひな形を作る Python スクリプト |
| `remotion-composer/` | Remotion + Three.js のプロジェクト。`src/` に完成例21本のシーンと共通部品、`public/` にその音声・効果音・フォント |
| `projects/` | 完成例21本の台本（`script.json`）・タイミング（`timing.md`）・アニメーション計画（`animation_plan.md`）。音声と書き出した動画は入れていません |
| `docs/` | 紅茶の雑学 40本の台本を改訂したときの見比べ（台本の設計の参考） |

## はじめに

必要なもの: Python 3.12 前後、Node.js 20 以上、ffmpeg（`brew install ffmpeg`）、ElevenLabs のアカウント。

1. Python の環境を作る。

   ```bash
   python3 -m venv .venv
   ```

   ```bash
   .venv/bin/pip install -r requirements.txt
   ```

2. Remotion の依存を入れる（1.7GB ほど。時間がかかります）。

   ```bash
   cd remotion-composer && npm ci
   ```

3. ElevenLabs の API キーを置く。`.env.example` を `.env` にコピーして `ELEVENLABS_API_KEY=` の後ろに書くか、環境変数 `ELEVENLABS_API_KEY` に入れます。無料プランのキーでは、ライブラリの声（Otani）を API で使えません（402）。その場合はスキルの手順どおり、elevenlabs.io の画面で生成します。

4. AI パターン（最後をプロフィールへの導線で終えるリール）を使うなら、`scripts/narration_reel/templates/profile_cta.png` を自分のアカウントのプロフィール画面のスクリーンショット（1055×2000）に差し替えます。今入っているのはダミーです。フォローボタンの位置が違うときは `remotion-composer/src/narration/ProfileCta.tsx` の `PROFILE_SHOT` を直します。

5. Codex のスキルとして使うなら、`skill/threejs-narration-reel` を `~/.codex/skills/` にコピーして Codex を起動し直します。コピーしなくても、このフォルダで Codex を起動すれば `AGENTS.md` からスキルを読みに行きます。

6. 動くか確かめる。完成例の静止画を2枚書き出します（サンドボックスの外で実行してください）。

   ```bash
   cd remotion-composer && COMP=ParadiseTea node golden-stills.mjs ../check 0 300
   ```

   `check/f0000.jpg` と `check/f0300.jpg` ができれば準備は完了です。初回だけ Chrome Headless Shell（約94MB）のダウンロードが走ります。`npm ci` で出る `esbuild` の install-scripts の警告は、そのままで書き出せます。

## なくても動くもの

- `whisper-cli`（whisper.cpp）とモデル `ggml-large-v3-turbo.bin`: Scribe のクレジットが切れたときの文字起こしの代わりにだけ使います。使うときは、モデルを `models/` に置くか、環境変数 `WHISPER_MODEL` にパスを入れます。
- `public/fonts/zenmaru/`: 字幕のフォントを保存したものです。消えたら `cd remotion-composer && node cache-fonts.mjs` で作り直せます。
