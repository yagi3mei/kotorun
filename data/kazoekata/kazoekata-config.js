/* =========================================
   File: kazoekata-config.js
   Purpose: 助数詞ゲーム設定一覧
   Author: やぎさん
   Created: 2026-05-13

    Notes:
    - 助数詞ごとのデータ管理
    - game.js側で共通利用
    - 助数詞追加時はここへ追加

    【助数詞追加手順】
    1. xxx-data.js を作成
        例：
        hiki-data.js

    2. images/kazoekata/ に
        対応画像を追加

    3. このconfigへimport追加

    4. このconfigへ設定追加
        label / kanji / question / data

    5. kazoekata-list.htmlへ
        ボタン追加

    ※ game.js 側の修正は不要
========================================= */


/* =========================
   データ読込
========================= */

import koData
    from "./ko-data.js";

import honData
    from "./hon-data.js";

import maiData
    from "./mai-data.js";

import ninData
    from "./nin-data.js";

import satsuData
    from "./satsu-data.js";

    
/* =========================
   設定一覧
========================= */

const config = {

    ko: {

        label: "こ",

        kanji: "個",

        question: "なんこ",

        data: koData

    },

    hon: {

        label: "ほん",

        kanji: "本",

        question: "なんぼん",

        data: honData

    },

    mai: {

        label: "まい",

        kanji: "枚",

        question: "なんまい",

        data: maiData

    },
    
    nin: {

        label: "にん",

        kanji: "人",

        question: "なんにん",

        data: ninData

    },

    satsu: {

        label: "さつ",

        kanji: "冊",

        question: "なんさつ",

        data: satsuData

    }

};


export default config;