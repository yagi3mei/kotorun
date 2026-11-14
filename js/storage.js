/* =========================================
   File: storage.js
   Purpose: 学習記録の保存・取得 共通モジュール
   Author: やぎさん
   Created: 2026-05-19

   Notes:
   - localStorage を使用
   - 各ゲームの最高記録のみ保存
   - ミス数優先 → 時間優先
========================================= */

/* =========================
   localStorage キー名
========================= */
export const STORAGE_KEY = "kotorun-score";


/* =========================
   全スコア取得
========================= */
export function loadScores() {

    const data = localStorage.getItem(STORAGE_KEY);

    // 初回起動時
    if (data === null) {
        return {};
    }

    try {
        const scores = JSON.parse(data);

        if (
            scores === null ||
            typeof scores !== "object" ||
            Array.isArray(scores)
        ) {
            throw new Error("スコアデータの形式が正しくありません。");
        }

        // カテゴリー・ゲーム単位のデータを検証
        for (const [category, games] of Object.entries(scores)) {

            if (
                games === null ||
                typeof games !== "object" ||
                Array.isArray(games)
            ) {
                throw new Error(
                    `スコアカテゴリーの形式が不正です: ${category}`
                );
            }

            for (const [gameKey, record] of Object.entries(games)) {

                if (
                    record === null ||
                    typeof record !== "object" ||
                    Array.isArray(record) ||
                    !Number.isFinite(record.time) ||
                    record.time <= 0 ||
                    !Number.isFinite(record.miss) ||
                    record.miss < 0
                ) {
                    throw new Error(
                        `ゲーム記録の形式が不正です: ${category} / ${gameKey}`
                    );
                }
            }
        }

        return scores;

    } catch (error) {

        console.error("score load error", error);

        throw new Error("スコアデータの読み込みに失敗しました。", {
            cause: error
        });
    }
}


/* =========================
   全スコア保存
========================= */
function saveAllScores(scores) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(scores)
    );
}


/* =========================
   スコア更新判定

   true  → 更新する
   false → 更新しない
========================= */
export function shouldUpdate(oldScore, newScore) {

    // データがないなら保存
    if (!oldScore) {
        return true;
    }

    // ミス数優先
    if (newScore.miss < oldScore.miss) {
        return true;
    }

    if (newScore.miss > oldScore.miss) {
        return false;
    }

    // ミス同じなら時間比較
    if (newScore.time < oldScore.time) {
        return true;
    }

    return false;
}


/* =========================
   スコア保存

   category:
       kana
       karuta
       family
       counter
       など

   key:
       hiragana_seion
       a
       watashi_no
       tsu
       など
========================= */
export function saveScore(category, key, result) {

     /* 不正データ防止 */
    if (
        typeof result.time !== "number"
        || result.time <= 0
        || typeof result.miss !== "number"
        || result.miss < 0
    ) {

        console.warn(
            "invalid score",
            result
        );

        return false;
    }
    
    const scores = loadScores();

    // category がないなら作成
    if (!scores[category]) {
        scores[category] = {};
    }

    const oldScore = scores[category][key];

    // 更新判定
    if (shouldUpdate(oldScore, result)) {

        scores[category][key] = {

            time: result.time,
            miss: result.miss,
            date: result.date
        };

        saveAllScores(scores);

        return true;
    }

    return false;
}


/* =========================
   スコア取得
========================= */
export function getScore(category, key) {

    const scores = loadScores();

    return scores?.[category]?.[key] || null;
}

/* =========================
   スコア復元（保存失敗時）
========================= */
export function restoreScore(category, key, previousScore) {

    const scores = loadScores();

    if (!scores[category]) {
        scores[category] = {};
    }

    // 保存前に記録がなかった場合
    if (previousScore === null) {

        delete scores[category][key];

        // 空になったカテゴリーを削除
        if (Object.keys(scores[category]).length === 0) {
            delete scores[category];
        }

    } else {

        // 保存前の記録に戻す
        scores[category][key] = previousScore;
    }

    saveAllScores(scores);
}

/* =========================
   category 単位取得

   例:
   getCategoryScores("kana")
========================= */
export function getCategoryScores(category) {

    const scores = loadScores();

    return scores?.[category] || {};
}


/* =========================
   全削除（開発用）
========================= */
export function clearScores() {

    localStorage.removeItem(STORAGE_KEY);
}