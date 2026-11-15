
/* =========================================
   File: progress-validation.js
   Purpose: 進捗データの形式検査
   Author: やぎさん
   Created: 2026-11-15
========================================= */

/* =========================
   モジュールの読み込み
========================= */
import badgeList from "../data/badges/badge-list.js";

/* =========================
   進捗データの形式検査
========================= */
export function validateProgressData(progress) {

    // 進捗データ全体の形式を確認
    if (
        progress === null ||
        typeof progress !== "object" ||
        Array.isArray(progress)
    ) {
        throw new Error("進捗データの形式が正しくありません。");
    }

    // 基本項目の検査
    if (
        typeof progress.migrationCompleted !== "boolean" ||
        !Number.isFinite(progress.points) ||
        progress.points < 0 ||
        !Number.isInteger(progress.lastBadgeId) ||
        progress.lastBadgeId < 0 ||
        progress.lastBadgeId > badgeList.length ||
        !Number.isFinite(progress.totalPlayTime) ||
        progress.totalPlayTime < 0 ||
        !Number.isInteger(progress.totalClearCount) ||
        progress.totalClearCount < 0
    ) {
        throw new Error("進捗データの項目が正しくありません。");
    }

    // 月別データの検査
    if (
        progress.monthly === null ||
        typeof progress.monthly !== "object" ||
        Array.isArray(progress.monthly)
    ) {
        throw new Error("月別学習記録の形式が正しくありません。");
    }

    for (const [month, record] of Object.entries(progress.monthly)) {

        if (
            !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
            record === null ||
            typeof record !== "object" ||
            Array.isArray(record) ||
            !Number.isFinite(record.playTime) ||
            record.playTime < 0 ||
            !Number.isInteger(record.clearCount) ||
            record.clearCount < 0
        ) {
            throw new Error(
                `月別学習記録が正しくありません: ${month}`
            );
        }
    }

    return true;
}
