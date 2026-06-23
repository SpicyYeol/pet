const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "PET rPPG Team";
pres.title = "Iteration 8: Spectrum + State Tracker — Beyond RGB Weights";

// Color palette (consistent with project history - Midnight/Teal)
const colors = {
  primary: "0F4C5C",      // Deep teal
  accent: "1A8A9B",       // Bright teal
  dark: "1E2761",         // Navy
  lightBg: "F7F9FC",
  white: "FFFFFF",
  text: "2C3E50",
  muted: "5D6D7E",
  success: "27AE60",
  warning: "E67E22"
};

// ========== SLIDE 1: Iteration 8 Title + Motivation ==========
let slide1 = pres.addSlide();
slide1.background = { color: colors.dark };

// Title
slide1.addText("Iteration 8", {
  x: 0.5, y: 0.8, w: 9, h: 0.6,
  fontSize: 18, color: "A0D2DB", fontFace: "Arial", bold: false
});

slide1.addText("Spectrum-Domain Selector + State Tracker", {
  x: 0.5, y: 1.3, w: 9, h: 1.0,
  fontSize: 32, color: colors.white, fontFace: "Arial", bold: true
});

slide1.addText("단순 RGB Weight 최적화를 넘어선 첫 번째 진짜 대안", {
  x: 0.5, y: 2.4, w: 9, h: 0.6,
  fontSize: 18, color: "A0D2DB", fontFace: "Arial", italic: true
});

// Problem box
slide1.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 3.2, w: 9, h: 1.8,
  fill: { color: "16213E" },
  rectRadius: 0.1
});

slide1.addText("한계 인식 (1/2/3 실험 결과)", {
  x: 0.7, y: 3.35, w: 8.6, h: 0.4,
  fontSize: 14, color: "F9A825", fontFace: "Arial", bold: true
});

slide1.addText("• RGB weight (v1 / high-HR focused / combined_correct) + Prior + Ensemble까지 동원해도 현실적 모드에서 36 MAE 한계\n• 특히 고심박 Video 3/7에서 peak ambiguity (100bpm artifact와의 경쟁)가 근본적으로 해결되지 않음\n• 결론: '더 좋은 weight 3개'를 찾는 게임 자체가 한계에 도달", {
  x: 0.7, y: 3.75, w: 8.6, h: 1.1,
  fontSize: 13, color: "E8E8E8", fontFace: "Arial"
});

// ========== SLIDE 2: Direction 1 — Spectrum Selector Results ==========
let slide2 = pres.addSlide();
slide2.background = { color: colors.lightBg };

slide2.addText("Direction 1: Spectrum-Domain Learned Selector", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 22, color: colors.dark, fontFace: "Arial", bold: true
});

slide2.addText("RGB Weight 완전 포기 → 스펙트럼 Shape 직접 모델링", {
  x: 0.5, y: 0.85, w: 9, h: 0.4,
  fontSize: 14, color: colors.accent, fontFace: "Arial", italic: true
});

// Key idea box
slide2.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 1.35, w: 9, h: 0.9,
  fill: { color: "E8F4F8" },
  rectRadius: 0.08
});

slide2.addText("핵심: 고정 views(Green, G-R 등)에서 binned spectrum + descriptors (peak 위치, high-HR vs artifact power ratio)만 사용. 60개 labeled window로 Ridge 학습.", {
  x: 0.7, y: 1.5, w: 8.6, h: 0.6,
  fontSize: 13, color: colors.text, fontFace: "Arial"
});

// Results table title
slide2.addText("7비디오 전체 결과 (동일 sampling 기준)", {
  x: 0.5, y: 2.4, w: 9, h: 0.35,
  fontSize: 14, color: colors.text, fontFace: "Arial", bold: true
});

// Simple table using shapes + text (for compatibility)
const tableData = [
  ["Config", "Overall MAE", "Video 3 (210)", "Video 7 (189.5)", "Video 8 (110.5)"],
  ["pure1 Spectrum (descriptors)", "18.2", "8.9 ★", "38.9", "1.6 ★"],
  ["이전 weight+prior+ensemble (참고)", "~36", "50~70+", "50~60+", "10~20"]
];

const startY = 2.85;
const rowH = 0.42;
const colWs = [3.2, 1.6, 1.8, 1.8, 1.6];
let x = 0.5;

tableData.forEach((row, ri) => {
  x = 0.5;
  row.forEach((cell, ci) => {
    const isHeader = ri === 0;
    const isBest = cell.includes("18.2") || cell.includes("8.9") || cell.includes("1.6");
    slide2.addShape(pres.ShapeType.rect, {
      x: x, y: startY + ri * rowH, w: colWs[ci], h: rowH,
      fill: { color: isHeader ? colors.primary : (isBest ? "D5F5E3" : (ri % 2 === 0 ? "FFFFFF" : "F4F6F7")) },
      line: { color: "BDC3C7", width: 0.5 }
    });
    slide2.addText(cell, {
      x: x + 0.08, y: startY + ri * rowH + 0.08, w: colWs[ci] - 0.16, h: rowH - 0.16,
      fontSize: isHeader ? 11 : 12, color: isHeader ? "FFFFFF" : colors.text, fontFace: "Arial",
      bold: isHeader || isBest, align: "center", valign: "middle"
    });
    x += colWs[ci];
  });
});

// Insight
slide2.addText("의미: 처음으로 'RGB weight vector' 없이 competitive한 성능(18.2) 달성. 특히 고심박 Video 3에서 극적인 개선.", {
  x: 0.5, y: 4.35, w: 9, h: 0.5,
  fontSize: 13, color: colors.success, fontFace: "Arial", bold: true
});

slide2.addText("CV (descriptors-only): 29.5 bpm | 학습 데이터 60개로도 의미 있는 신호 포착", {
  x: 0.5, y: 4.8, w: 9, h: 0.35,
  fontSize: 11, color: colors.muted, fontFace: "Arial"
});

// ========== SLIDE 3: Direction 3 + Overall Takeaway ==========
let slide3 = pres.addSlide();
slide3.background = { color: colors.lightBg };

slide3.addText("Direction 3: State Tracker + 종합 교훈", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 22, color: colors.dark, fontFace: "Arial", bold: true
});

// Tracker box
slide3.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 1.0, w: 4.3, h: 2.0,
  fill: { color: "FFFFFF" },
  line: { color: "AED6F1", width: 1.5 },
  rectRadius: 0.1
});

slide3.addText("Direction 3: Kalman Tracker", {
  x: 0.7, y: 1.15, w: 4, h: 0.35,
  fontSize: 13, color: colors.primary, fontFace: "Arial", bold: true
});

slide3.addText("• 2-state (HR + velocity)\n• 개 생리학 제약 명시적 모델링\n• 기존 IIR Prior 완전 대체\n• pure3 (약한 obs): 41.3 MAE\n→ 관측 품질이 핵심", {
  x: 0.7, y: 1.55, w: 4, h: 1.3,
  fontSize: 12, color: colors.text, fontFace: "Arial"
});

// 1+3 box
slide3.addShape(pres.ShapeType.roundRect, {
  x: 5.0, y: 1.0, w: 4.5, h: 2.0,
  fill: { color: "FFFFFF" },
  line: { color: "F5B7B1", width: 1.5 },
  rectRadius: 0.1
});

slide3.addText("1+3 통합 결과", {
  x: 5.2, y: 1.15, w: 4.1, h: 0.35,
  fontSize: 13, color: "C0392B", fontFace: "Arial", bold: true
});

slide3.addText("pure1 (Spectrum): 18.2\n1+3: 27.4 (아직 calibration 부족)\n\n→ Spectrum uncertainty를 더 정확히\n   추정하면 1+3이 진짜 강력해질 것", {
  x: 5.2, y: 1.55, w: 4.1, h: 1.3,
  fontSize: 12, color: colors.text, fontFace: "Arial"
});

// Big takeaway
slide3.addShape(pres.ShapeType.roundRect, {
  x: 0.5, y: 3.2, w: 9, h: 1.5,
  fill: { color: colors.dark },
  rectRadius: 0.1
});

slide3.addText("핵심 메시지", {
  x: 0.7, y: 3.35, w: 8.6, h: 0.35,
  fontSize: 14, color: "F9A825", fontFace: "Arial", bold: true
});

slide3.addText("\"우리는 이제 '더 좋은 weight 3개'를 찾는 단계를 넘어,\n강아지 심박 신호의 본질적 특성(스펙트럼 shape + 생리학적 시간 변화)을 직접 모델링하기 시작했습니다.\"\n\n다음 과제: Spectrum 학습 데이터 대량 확보 + tiny 1D conv + uncertainty calibration", {
  x: 0.7, y: 3.7, w: 8.6, h: 0.9,
  fontSize: 13, color: "FFFFFF", fontFace: "Arial"
});

// Save
pres.writeFile({ fileName: "reports/PET_RPPG_Iteration8_Spectrum_Tracker_Slides.pptx" })
  .then(() => console.log("Generated: reports/PET_RPPG_Iteration8_Spectrum_Tracker_Slides.pptx"))
  .catch(err => console.error("Error:", err));