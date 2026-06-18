/* =========================
   日付
========================= */

export const dayData = [

    {
        id: "ototoi",
        reading: "おととい（一昨日）",
        speech: "おととい",
        offset: -2,
        group: "day"
    },

    {
        id: "kinou",
        reading: "きのう（昨日）",
        speech: "きのう",
        offset: -1,
        group: "day"
    },

    {
        id: "kyou",
        reading: "きょう（今日）",
        speech: "きょう",
        offset: 0,
        group: "day"
    },

    {
        id: "ashita",
        reading: "あした（明日）",
        speech: "あした",
        offset: 1,
        group: "day"
    },

    {
        id: "asatte",
        reading: "あさって（明後日）",
        speech: "あさって",
        offset: 2,
        group: "day"    
    }

];

/* =========================
   週
========================= */

export const weekData = [

    {
        id: "sensenshuu",
        reading: "せんせんしゅう（先々週）",
        speech: "せんせんしゅう",
        offset: -2,
        group: "week"
    },

    {
        id: "senshuu",
        reading: "せんしゅう（先週）",
        speech: "せんしゅう",
        offset: -1,
        group: "week"
    },

    {
        id: "konshuu",
        reading: "こんしゅう（今週）",
        speech: "こんしゅう",
        offset: 0,
        group: "week"
    },

    {
        id: "raishuu",
        reading: "らいしゅう（来週）",
        speech: "らいしゅう",
        offset: 1,
        group: "week"
    },

    {
        id: "saraishuu",
        reading: "さらいしゅう（再来週）",
        speech: "さらいしゅう",
        offset: 2,
        group: "week"
    }

];

/* =========================
   月
========================= */

export const monthData = [

    {
        id: "sensengetsu",
        reading: "せんせんげつ（先々月）",
        speech: "せんせんげつ",
        offset: -2,
        group: "month"
    },

    {
        id: "sengetsu",
        reading: "せんげつ（先月）",
        speech: "せんげつ",
        offset: -1,
        group: "month"
    },

    {
        id: "kongetsu",
        reading: "こんげつ（今月）",
        speech: "こんげつ",
        offset: 0,
        group: "month"
    },

    {
        id: "raigetsu",
        reading: "らいげつ（来月）",
        speech: "らいげつ",
        offset: 1,
        group: "month"
    },

    {
        id: "saraigetsu",
        reading: "さらいげつ（再来月）",
        speech: "さらいげつ",
        offset: 2,
        group: "month"
    }

];

/* =========================
   年
========================= */

export const yearData = [

    {
        id: "ototoshi",
        reading: "おととし（一昨年）",
        speech: "おととし",
        offset: -2,
        group: "year"
    },

    {
        id: "kyonen",
        reading: "きょねん（去年）",
        speech: "きょねん",
        offset: -1,
        group: "year"
    },

    {
        id: "kotoshi",
        reading: "ことし（今年）",
        speech: "ことし",
        offset: 0,
        group: "year"
    },

    {
        id: "rainen",
        reading: "らいねん（来年）",
        speech: "らいねん",
        offset: 1,
        group: "year"
    },

    {
        id: "sarainen",
        reading: "さらいねん（再来年）",
        speech: "さらいねん",
        offset: 2,
        group: "year"
    }

];

/* =========================
   ランダム用
========================= */

export const allRelativeTimeData = [
    ...dayData,
    ...weekData,
    ...monthData,
    ...yearData
];