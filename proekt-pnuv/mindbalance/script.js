/* ============================================================
   Никни — логика
   Демо-режим: секое „Зачувај ден“ симулира еден нов ден во рамки
   на истата сесија, за да можеш веднаш да видиш како расте
   градината. Ништо не се испраќа или складира на сервер.
   ============================================================ */

(function () {
  "use strict";

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  /* ---------- State ---------- */
  var growth = 15;          // 0–100, кумулативен раст на градината
  var history = [];         // [{day, score}]
  var STEM_LENGTH = 148;

  var HABITS = ["sleep", "activity", "screenfree", "water", "outdoors"];

  /* ---------- DOM refs ---------- */
  var stemLine = document.getElementById("stemLine");
  var leaf1 = document.getElementById("leaf1");
  var leaf2 = document.getElementById("leaf2");
  var bud = document.getElementById("bud");
  var flower = document.getElementById("flower");
  var gardenStage = document.getElementById("gardenStage");
  var growthPct = document.getElementById("growthPct");
  var gardenMsg = document.getElementById("gardenMsg");
  var dayCountEl = document.getElementById("dayCount");
  var streakCountEl = document.getElementById("streakCount");
  var historyStrip = document.getElementById("historyStrip");
  var historyEmpty = document.getElementById("historyEmpty");
  var saveDayBtn = document.getElementById("saveDayBtn");

  function stageNameFor(g) {
    if (g < 20) return "Семе";
    if (g < 40) return "Никулец";
    if (g < 60) return "Растение";
    if (g < 80) return "Пупка";
    return "Цвет";
  }

  function renderGarden() {
    var offset = clamp(STEM_LENGTH * (1 - growth / 100), 0, STEM_LENGTH);
    stemLine.style.strokeDashoffset = offset;

    leaf1.style.opacity = growth >= 25 ? 1 : 0;
    leaf2.style.opacity = growth >= 50 ? 1 : 0;
    bud.style.opacity = (growth >= 65 && growth < 85) ? 1 : 0;
    flower.style.opacity = growth >= 85 ? 1 : 0;

    gardenStage.textContent = stageNameFor(growth);
    growthPct.textContent = Math.round(growth);
  }

  function renderBadges() {
    dayCountEl.textContent = history.length;

    var streak = 0;
    for (var i = history.length - 1; i >= 0; i--) {
      if (history[i].score >= 60) streak++;
      else break;
    }
    streakCountEl.textContent = streak;
  }

  function renderHistory() {
    if (history.length === 0) {
      historyEmpty.hidden = false;
      historyStrip.hidden = true;
      return;
    }
    historyEmpty.hidden = true;
    historyStrip.hidden = false;
    historyStrip.innerHTML = "";
    history.forEach(function (entry) {
      var dot = document.createElement("span");
      var tier = entry.score >= 70 ? "high" : (entry.score >= 40 ? "mid" : "low");
      dot.className = "history-dot history-dot--" + tier;
      dot.title = "Ден " + entry.day + " — " + entry.score + "/100";
      dot.textContent = "Д" + entry.day;
      historyStrip.appendChild(dot);
    });
  }

  function messageFor(score) {
    if (score >= 80) return "Силен ден! 🌟 Градината благодари.";
    if (score >= 40) return "Добар почеток — секој мал чекор помага.";
    return "Не грижи се, утре е нов ден 🌱";
  }

  /* ---------- Save day ---------- */
  saveDayBtn.addEventListener("click", function () {
    var checked = 0;
    HABITS.forEach(function (h) {
      var box = document.querySelector('input[data-habit="' + h + '"]');
      if (box.checked) checked++;
    });
    var dayScore = checked * 20;

    growth = clamp(growth + (dayScore - 50) / 5, 0, 100);
    history.push({ day: history.length + 1, score: dayScore });

    renderGarden();
    renderBadges();
    renderHistory();
    gardenMsg.textContent = messageFor(dayScore);

    // ресетирај штиклирања за следниот "ден"
    HABITS.forEach(function (h) {
      document.querySelector('input[data-habit="' + h + '"]').checked = false;
    });
  });

  /* ---------- Initial render ---------- */
  renderGarden();
  renderBadges();
  renderHistory();
})();
