/* =========================================
   File: analytics.js
   Purpose : Google Analytics制御
   Author  : やぎさん
   Created : 2026-06-05

   Notes:
   - Google Analyticsの初期化
========================================= */
window.dataLayer =
    window.dataLayer || [];

function gtag()
{
    dataLayer.push(arguments);
}

gtag(
    "js",
    new Date()
);

gtag(
    "config",
    "G-B80JQLPCH4"
);