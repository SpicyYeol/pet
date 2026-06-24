// Build the R&D proposal deck (Korean). Not for git; *.pptx is gitignored.
// Run: NODE_PATH="$(npm root -g)" node proposal/build_deck.js
const pptxgen = require("pptxgenjs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const img = (p) => path.join(ROOT, p);

const F = "Malgun Gothic";
const DARK = "0B2A33", INK = "143A42", MUT = "5B7682";
const TEAL = "0E7C7B", TEAL2 = "12A39A", MINT = "9FE3DB";
const ACCENT = "E8883A", PANEL = "EEF5F5", LINEC = "CFE0E0";
const GRN = "22C55E", AMB = "F59E0B", RED = "EF4444", WHITE = "FFFFFF";

const p = new pptxgen();
p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
p.layout = "W";
p.author = "VET-PPG / petvitals";
p.title = "AI 기반 비접촉 정밀진단·통합 모니터링 플랫폼";
const W = 13.333, H = 7.5;
const shadow = () => ({ type: "outer", color: "0B2A33", blur: 7, offset: 3, angle: 90, opacity: 0.12 });

function footer(s, n) {
  s.addText("AI 기반 비접촉 정밀진단·통합 모니터링 플랫폼", { x: 0.55, y: H - 0.42, w: 8, h: 0.3, fontFace: F, fontSize: 8.5, color: MUT, align: "left" });
  s.addText(String(n), { x: W - 1.0, y: H - 0.42, w: 0.5, h: 0.3, fontFace: F, fontSize: 9, color: MUT, align: "right" });
}
function heading(s, eyebrow, title) {
  s.addText(eyebrow.toUpperCase(), { x: 0.55, y: 0.45, w: 11, h: 0.3, fontFace: F, fontSize: 11, color: TEAL, bold: true, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.55, y: 0.74, w: 12.2, h: 0.7, fontFace: F, fontSize: 27, color: INK, bold: true, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || WHITE }, line: { color: LINEC, width: 1 }, shadow: shadow() });
}
function numCircle(s, x, y, d, label, fill) {
  s.addShape(p.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill || TEAL } });
  s.addText(label, { x, y, w: d, h: d, fontFace: F, fontSize: 13, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
}

/* ---------- S1 Title ---------- */
let s = p.addSlide(); s.background = { color: DARK };
s.addShape(p.shapes.OVAL, { x: 10.6, y: -1.6, w: 5.2, h: 5.2, fill: { color: TEAL, transparency: 78 } });
s.addShape(p.shapes.OVAL, { x: 11.6, y: 3.6, w: 4.4, h: 4.4, fill: { color: ACCENT, transparency: 86 } });
s.addText("정밀의료 R&D 제안  ·  AI 진단 의료기기 개발", { x: 0.8, y: 1.55, w: 11, h: 0.4, fontFace: F, fontSize: 13, color: MINT, bold: true, charSpacing: 1, margin: 0 });
s.addText("AI 기반 비접촉 정밀진단\n통합 모니터링 플랫폼", { x: 0.8, y: 2.05, w: 11.5, h: 2.0, fontFace: F, fontSize: 40, color: WHITE, bold: true, lineSpacingMultiple: 1.02, margin: 0 });
s.addText("다중 활력·행동 신호를 융합한 조기경보(EWS)로 난치성·중증 환자와 반려동물의 상태를\n카메라만으로 비접촉 정밀 모니터링하고, 의사결정을 지원하는 통합 플랫폼", { x: 0.8, y: 4.25, w: 11.2, h: 1.0, fontFace: F, fontSize: 14.5, color: "C7DCDC", lineSpacingMultiple: 1.15, margin: 0 });
s.addText([
  { text: "비접촉 rPPG", options: { color: WHITE } }, { text: "   ·   ", options: { color: TEAL2 } },
  { text: "DLC 포즈·행동", options: { color: WHITE } }, { text: "   ·   ", options: { color: TEAL2 } },
  { text: "플러그인 분석 8축", options: { color: WHITE } }, { text: "   ·   ", options: { color: TEAL2 } },
  { text: "통합 EWS", options: { color: WHITE } },
], { x: 0.8, y: 5.7, w: 11.5, h: 0.4, fontFace: F, fontSize: 12.5, bold: true, margin: 0 });
s.addText("제안기관 ○○○   ·   2026", { x: 0.8, y: 6.5, w: 6, h: 0.35, fontFace: F, fontSize: 11, color: MUT, margin: 0 });
s.addNotes("표지. 핵심 메시지: 카메라만으로 환자·동물의 심박·호흡·행동을 비접촉으로 측정하고, 이를 하나의 조기경보(EWS)로 융합해 악화를 조기에 잡아내는 플랫폼입니다. 한 문장으로 시작하고 청중의 시선을 끄세요.");

/* ---------- S2 과제 개요 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Overview", "과제 개요 — A. AI 기반 정밀진단기술 확보 및 진단 의료기기 개발");
const ov = [
  ["목표", "난치성·중증 질환 중심의 비접촉 정밀진단·예측모델 고도화 기술 확보 및 진단 의료기기 개발", TEAL],
  ["개발 형태", "첨단바이오 융합형 · 의사결정 지원형 · 통합 모니터링 플랫폼", TEAL2],
  ["기능 형태", "의료기기 · 소프트웨어(SaMD) · 진단 DB 구축 · 진단보조서비스", ACCENT],
  ["산출물", "핵심성능지표·성과목표 기반 제품 3종 이상 개발 + 사업화 전략·로드맵", "1C7293"],
];
let yy = 1.7;
ov.forEach((r, i) => {
  card(s, 0.55, yy, 12.2, 1.05, i % 2 ? WHITE : PANEL);
  s.addText(r[0], { x: 0.85, y: yy, w: 2.5, h: 1.05, fontFace: F, fontSize: 17, color: r[2], bold: true, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 3.5, y: yy, w: 9.0, h: 1.05, fontFace: F, fontSize: 14.5, color: INK, valign: "middle", margin: 0 });
  yy += 1.22;
});
s.addText("→ 본 제안은 동일 코어 기술을 반려동물(조기 사업화·데이터 확보)과 인체(정밀의료 확장)에 적용하는 One-Health 전략", { x: 0.55, y: yy + 0.05, w: 12.2, h: 0.4, fontFace: F, fontSize: 12, color: MUT, italic: true, margin: 0 });
s.addNotes("과제 개요. 목표는 AI 기반 비접촉 정밀진단과 진단 의료기기 개발입니다. 개발 형태는 첨단바이오 융합형·의사결정 지원형·통합 모니터링 플랫폼, 기능은 의료기기·소프트웨어·DB·진단보조서비스. 핵심성능지표 기반 제품 3종 이상과 사업화 로드맵까지 제시합니다. 동물에서 인체로 확장하는 One-Health가 차별점임을 강조하세요.");
footer(s, 2);

/* ---------- S3 배경 & 필요성 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Background", "배경 & 필요성");
const probs = [
  ["접촉식 모니터링의 한계", "센서 부착·구속이 스트레스를 유발하고 활력징후를 왜곡(흰가운 효과). 신생아·중증·거동 곤란·비협조 환자에서 적용이 어려움."],
  ["HR·RR만으로는 불충분", "ICU 수준 판단에는 산소화·관류·체온·리듬·행동·추세가 필요. 단일 지표는 악화를 놓치거나 오경보를 유발."],
  ["연속·통합 모니터링 부재", "야간·인력 부족 시간대의 감시 공백. 분절된 지표를 통합해 악화를 조기 예측하는 의사결정 지원이 미흡."],
];
yy = 1.85;
probs.forEach((r, i) => {
  numCircle(s, 0.6, yy + 0.05, 0.55, String(i + 1), TEAL);
  s.addText(r[0], { x: 1.35, y: yy - 0.05, w: 6.7, h: 0.45, fontFace: F, fontSize: 16, color: INK, bold: true, margin: 0 });
  s.addText(r[1], { x: 1.35, y: yy + 0.42, w: 6.9, h: 1.0, fontFace: F, fontSize: 12.5, color: MUT, lineSpacingMultiple: 1.1, margin: 0 });
  yy += 1.62;
});
card(s, 8.55, 1.85, 4.2, 4.3, DARK);
s.addText("핵심 수요", { x: 8.85, y: 2.05, w: 3.6, h: 0.4, fontFace: F, fontSize: 13, color: MINT, bold: true, margin: 0 });
s.addText("비접촉·연속·통합", { x: 8.85, y: 2.5, w: 3.7, h: 1.2, fontFace: F, fontSize: 26, color: WHITE, bold: true, lineSpacingMultiple: 1.0, margin: 0 });
s.addText([
  { text: "환자/동물을 건드리지 않고\n", options: { breakLine: true } },
  { text: "여러 활력·행동을 동시에\n", options: { breakLine: true } },
  { text: "추세로 악화를 조기 예측", options: {} },
], { x: 8.85, y: 4.0, w: 3.7, h: 1.6, fontFace: F, fontSize: 13.5, color: "C7DCDC", lineSpacingMultiple: 1.2, margin: 0 });
s.addNotes("배경·필요성. 접촉식은 스트레스와 신호 왜곡(흰가운 효과)이 크고 신생아·중증·거동곤란 환자에 적용이 어렵습니다. HR·RR 단일 지표만으로는 ICU 수준 판단이 어렵고, 야간·인력부족 시간대 감시 공백이 큽니다. 그래서 비접촉·연속·통합 모니터링 수요가 분명하다는 점을 짚으세요.");
footer(s, 3);

/* ---------- S4 기회 One-Health ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Opportunity", "기회 — One-Health 이중 트랙 (동일 코어 기술)");
function track(x, title, color, items, tag) {
  card(s, x, 1.85, 5.85, 4.3, WHITE);
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: 2.1, w: 2.2, h: 0.5, rectRadius: 0.08, fill: { color } });
  s.addText(tag, { x: x + 0.3, y: 2.1, w: 2.2, h: 0.5, fontFace: F, fontSize: 12, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(title, { x: x + 0.3, y: 2.75, w: 5.2, h: 0.5, fontFace: F, fontSize: 18, color: INK, bold: true, margin: 0 });
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } })),
    { x: x + 0.35, y: 3.35, w: 5.2, h: 2.6, fontFace: F, fontSize: 13, color: INK, margin: 0 });
}
track(0.55, "반려동물 (수의)", TEAL, [
  "동물병원·ICU 모니터링: 빠른 사업화 진입점",
  "규제 부담 낮아 데이터·실증 신속 확보",
  "공포·구속 없는 측정(특히 고양이) 차별화",
], "동물");
track(6.9, "인체 의료", ACCENT, [
  "난치성·중증·신생아·거동곤란 환자 모니터링",
  "비접촉 연속 활력 + 악화 조기예측(EWS)",
  "재택·야간 무인 감시로 확장",
], "사람");
s.addText("동물 트랙에서 확보한 데이터·검증을 인체 정밀의료로 단계적 확장 (기술·플랫폼 공통)", { x: 0.55, y: 6.35, w: 12.2, h: 0.4, fontFace: F, fontSize: 12, color: MUT, italic: true, margin: 0 });
s.addNotes("전략 핵심. 동일한 코어 기술을 두 시장에 적용합니다. 반려동물(수의)에서 빠르게 사업화하고 데이터·검증을 확보한 뒤, 인체의 난치성·중증·신생아·거동곤란 환자 모니터링으로 확장합니다. 규제 부담이 낮은 동물 시장이 진입점이라는 논리를 설명하세요.");
footer(s, 4);

/* ---------- S5 핵심 기술 구성 (architecture) ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Core Technology", "핵심 기술 구성 — 플러그인 분석 파이프라인");
// flow boxes
function flowBox(x, y, w, h, title, sub, fill, tc) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: LINEC, width: 1 }, shadow: shadow() });
  s.addText(title, { x, y: y + 0.12, w, h: 0.4, fontFace: F, fontSize: 13.5, color: tc || INK, bold: true, align: "center", margin: 0 });
  s.addText(sub, { x: x + 0.1, y: y + 0.5, w: w - 0.2, h: h - 0.55, fontFace: F, fontSize: 10.5, color: tc ? "C7DCDC" : MUT, align: "center", valign: "top", lineSpacingMultiple: 1.05, margin: 0 });
}
function arrow(x, y, w) { s.addShape(p.shapes.LINE, { x, y, w, h: 0, line: { color: TEAL, width: 2.5, endArrowType: "triangle" } }); }
flowBox(0.55, 2.2, 2.5, 1.5, "입력", "영상(RGB) +\nDLC 키포인트", PANEL);
arrow(3.12, 2.95, 0.5);
flowBox(3.68, 2.2, 2.4, 1.5, "Session", "공통 입력 단위\n(영상·fps·기하)", PANEL);
arrow(6.13, 2.95, 0.5);
flowBox(6.7, 2.2, 3.0, 1.5, "분석기 8축", "pose·rppg·hrv·feeding\nspo2·temp·호흡·점막색", TEAL, WHITE);
arrow(9.75, 2.95, 0.5);
flowBox(10.3, 2.2, 2.45, 1.5, "통합 EWS", "조기경보 융합\n+ 의사결정", ACCENT, WHITE);
// baseline + dashboard row
flowBox(6.7, 4.05, 3.0, 1.1, "종/품종/개체 baseline", "개인화 정상범위", PANEL);
flowBox(10.3, 4.05, 2.45, 1.1, "대시보드/API", "모니터링·리포트", PANEL);
s.addShape(p.shapes.LINE, { x: 8.2, y: 3.7, w: 0, h: 0.35, line: { color: MUT, width: 1.5, endArrowType: "triangle" } });
s.addShape(p.shapes.LINE, { x: 11.5, y: 3.7, w: 0, h: 0.35, line: { color: MUT, width: 1.5, endArrowType: "triangle" } });
card(s, 0.55, 5.5, 12.2, 0.95, PANEL);
s.addText([
  { text: "플러그인 구조: ", options: { bold: true, color: TEAL } },
  { text: "새 기능 = 분석기 파일 1개 추가 → CLI·EWS·UI에 자동 합류. ", options: { color: INK } },
  { text: "SpO₂·체온은 외부 센서(펄스옥시미터·열화상) 입력을 받아 동일 EWS로 융합.", options: { color: MUT } },
], { x: 0.85, y: 5.5, w: 11.6, h: 0.95, fontFace: F, fontSize: 12.5, valign: "middle", lineSpacingMultiple: 1.1, margin: 0 });
s.addNotes("기술 구성. 영상과 DLC 키포인트가 공통 입력(Session)으로 들어와 8개 분석기를 거쳐 통합 EWS로 융합됩니다. 플러그인 구조라 새 지표·센서를 분석기 하나 추가로 붙일 수 있다는 확장성이 핵심입니다. SpO₂·체온은 외부 센서 입력을 받아 같은 EWS로 합류함을 설명하세요.");
footer(s, 5);

/* ---------- S6 정밀진단·예측모델 고도화 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Precision Model", "정밀진단·예측모델 고도화 — 다중신호 융합 EWS");
const rows = [
  ["pose", "자세·활동·부동(욕창 위험)"],
  ["rppg", "심박(HR)·호흡(RR)·헐떡임"],
  ["hrv", "심박변이도 SDNN/RMSSD"],
  ["resp_effort", "호흡 패턴·무호흡·노력성"],
  ["spo2 / temperature", "산소포화도·체온(센서)"],
  ["mucous / feeding", "점막색(관류)·구강활동"],
];
s.addText("8축 분석기 (활력 + 행동)", { x: 0.55, y: 1.75, w: 6, h: 0.4, fontFace: F, fontSize: 14, color: INK, bold: true, margin: 0 });
const tbl = rows.map((r, i) => ([
  { text: r[0], options: { fontFace: F, fontSize: 12, bold: true, color: TEAL, fill: { color: i % 2 ? WHITE : PANEL }, valign: "middle" } },
  { text: r[1], options: { fontFace: F, fontSize: 12, color: INK, fill: { color: i % 2 ? WHITE : PANEL }, valign: "middle" } },
]));
s.addTable(tbl, { x: 0.55, y: 2.2, w: 6.1, colW: [2.5, 3.6], rowH: 0.52, border: { pt: 1, color: LINEC } });
card(s, 7.0, 1.75, 5.75, 4.45, WHITE);
s.addText("고도화 포인트", { x: 7.3, y: 1.95, w: 5, h: 0.4, fontFace: F, fontSize: 14, color: ACCENT, bold: true, margin: 0 });
s.addText([
  { text: "개체·종·품종별 baseline 개인화", options: { bullet: true, breakLine: true, bold: true, paraSpaceAfter: 3 } },
  { text: "고정 임계값 대신 개체 기준 편차로 경보 (오경보↓)", options: { bullet: true, indentLevel: 1, breakLine: true, color: MUT, fontSize: 11, paraSpaceAfter: 8 } },
  { text: "다중신호 융합 조기경보(EWS)", options: { bullet: true, breakLine: true, bold: true, paraSpaceAfter: 3 } },
  { text: "분석기별 sub-score 합산 → 중증도 밴드 + 근거 제시", options: { bullet: true, indentLevel: 1, breakLine: true, color: MUT, fontSize: 11, paraSpaceAfter: 8 } },
  { text: "신호품질 게이팅으로 노이즈 오검출 억제", options: { bullet: true, breakLine: true, bold: true, paraSpaceAfter: 3 } },
  { text: "악화예측 모델로 확장 (시계열·추세 학습)", options: { bullet: true, indentLevel: 1, color: MUT, fontSize: 11 } },
], { x: 7.35, y: 2.45, w: 5.2, h: 3.6, fontFace: F, fontSize: 13, color: INK, margin: 0 });
s.addNotes("정밀진단·예측모델 고도화. 활력 5축과 행동 3축을 융합하고, 종·품종·개체 baseline으로 개인화해 고정 임계값의 오경보를 줄입니다. 신호품질 게이팅으로 노이즈 오검출을 억제하며, 향후 시계열 학습으로 악화예측 모델로 발전시킵니다.");
footer(s, 6);

/* ---------- S7 개발 형태 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Development Form", "개발 형태 — 3가지 축");
const forms = [
  ["첨단바이오 융합형", TEAL, ["rPPG(광용적맥파) 영상신호", "DLC 동물 포즈·행동 AI", "생리·행동 멀티모달 융합"]],
  ["의사결정 지원형", ACCENT, ["통합 조기경보(EWS) 점수", "근거(사유)·플래그 제시", "중증도 밴드·우선순위화"]],
  ["통합 모니터링 플랫폼", "1C7293", ["다중 카메라 동시 모니터링", "환자별 대시보드·추세", "센서(IR/SpO₂) 통합 확장"]],
];
let fx = 0.55;
forms.forEach((c) => {
  card(s, fx, 1.95, 3.95, 4.0, WHITE);
  s.addShape(p.shapes.OVAL, { x: fx + 0.35, y: 2.3, w: 0.7, h: 0.7, fill: { color: c[1] } });
  s.addText(c[0], { x: fx + 0.3, y: 3.15, w: 3.4, h: 0.7, fontFace: F, fontSize: 16, color: INK, bold: true, margin: 0 });
  s.addText(c[2].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 7 } })),
    { x: fx + 0.35, y: 3.95, w: 3.35, h: 1.9, fontFace: F, fontSize: 12.5, color: MUT, margin: 0 });
  fx += 4.13;
});
s.addNotes("개발 형태 3축을 우리 기술로 구체화합니다. 첨단바이오 융합형은 rPPG와 포즈·행동 AI의 멀티모달 융합, 의사결정 지원형은 EWS 점수와 근거·플래그 제시, 통합 모니터링 플랫폼은 다중 카메라와 IR/SpO₂ 센서 통합입니다.");
footer(s, 7);

/* ---------- S8 기능 구성 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Functions", "기능 구성 — 의료기기 · SW · DB · 진단보조서비스");
const fns = [
  ["의료기기", "다중 카메라 비접촉 모니터링 장치 (HW+SW, SaMD 포함)"],
  ["소프트웨어", "petvitals 분석 엔진 · 통합 EWS · 대시보드"],
  ["DB 구축", "활력·행동·라벨·개체 프로파일 정밀진단 DB"],
  ["진단보조서비스", "EWS API·리포트·알람으로 임상 의사결정 지원"],
];
let qx = 0.55, qy = 1.95;
fns.forEach((c, i) => {
  const x = qx + (i % 2) * 6.25, y = qy + Math.floor(i / 2) * 2.1;
  card(s, x, y, 5.95, 1.85, i % 2 ? PANEL : WHITE);
  numCircle(s, x + 0.3, y + 0.32, 0.5, String(i + 1), TEAL);
  s.addText(c[0], { x: x + 1.0, y: y + 0.28, w: 4.7, h: 0.5, fontFace: F, fontSize: 16, color: INK, bold: true, margin: 0 });
  s.addText(c[1], { x: x + 1.0, y: y + 0.82, w: 4.8, h: 0.9, fontFace: F, fontSize: 12.5, color: MUT, lineSpacingMultiple: 1.1, margin: 0 });
});
s.addNotes("기능 4종을 설명합니다. 의료기기는 다중 카메라 비접촉 모니터링 장치, 소프트웨어는 petvitals 분석엔진과 통합 EWS·대시보드, DB는 활력·행동·라벨·개체 프로파일, 진단보조서비스는 EWS API·리포트·알람입니다. 이 네 형태가 과제 요구사항에 직접 대응함을 강조하세요.");
footer(s, 8);

/* ---------- S9 진행현황1 rPPG 성능 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Progress ①", "진행 현황 ① — rPPG 심박 추정 성능 진화");
s.addChart(p.charts.BAR, [{
  name: "MAE(bpm)", labels: ["기준\n얼굴박스", "해부학\nROI", "A+B\n전처리", "멀티\n패치", "적응형\n선택", "개\n전용 v1"],
  values: [80, 60, 50, 44, 40, 37.5],
}], {
  x: 0.55, y: 1.9, w: 7.6, h: 4.3, barDir: "col", chartColors: [TEAL],
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontFace: F, dataLabelFontSize: 10,
  catAxisLabelColor: MUT, catAxisLabelFontFace: F, catAxisLabelFontSize: 9,
  valAxisLabelColor: MUT, valAxisHidden: false, valGridLine: { color: "E6EDED", size: 0.5 },
  showLegend: false, showTitle: false, valAxisMaxVal: 90, valAxisMinVal: 0,
});
card(s, 8.45, 1.95, 4.3, 1.9, PANEL);
s.addText("핵심 성과", { x: 8.7, y: 2.1, w: 3.8, h: 0.35, fontFace: F, fontSize: 12, color: ACCENT, bold: true, margin: 0 });
s.addText([
  { text: "오차 ~80 → 37.5 bpm", options: { bold: true, breakLine: true, color: INK, fontSize: 15 } },
  { text: "고심박(Video7) 21.3 bpm 달성", options: { color: MUT, fontSize: 11.5 } },
], { x: 8.7, y: 2.5, w: 3.85, h: 1.2, fontFace: F, lineSpacingMultiple: 1.15, margin: 0 });
s.addImage({ path: img("docs/img/bvp_waveforms.png"), x: 9.15, y: 4.0, w: 1.42, h: 2.18 });
s.addText("복원된 rPPG 맥파(BVP)\n클립별 파형", { x: 10.75, y: 4.6, w: 2.0, h: 1.0, fontFace: F, fontSize: 10.5, color: MUT, margin: 0 });
s.addNotes("진행현황①. rPPG 심박 오차를 단계적 개선으로 약 80에서 37.5bpm까지 절반 가까이 줄였고, 가장 어려운 고심박 케이스에서는 21.3bpm까지 달성했습니다. 실제 복원된 맥파(BVP)를 함께 보여줍니다. 단, 동물·영상 단위 라벨 기준의 프로토타입 결과임을 분명히 하세요.");
footer(s, 9);

/* ---------- S10 진행현황2 EWS ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Progress ②", "진행 현황 ② — 행동+생리 통합 EWS 실증");
s.addImage({ path: img("docs/img/dashboard.png"), x: 0.55, y: 1.95, w: 7.2, h: 4.24 });
s.addText("대시보드 환자 상세 (실데이터)", { x: 0.55, y: 6.2, w: 7, h: 0.3, fontFace: F, fontSize: 10, color: MUT, italic: true, margin: 0 });
card(s, 8.05, 1.95, 4.7, 4.25, WHITE);
s.addText("실증 내용", { x: 8.3, y: 2.15, w: 4.2, h: 0.4, fontFace: F, fontSize: 14, color: TEAL, bold: true, margin: 0 });
s.addText([
  { text: "8개 분석기 → 하나의 EWS로 융합", options: { bullet: true, breakLine: true, paraSpaceAfter: 7 } },
  { text: "중증도 밴드(안정/주의/우려/위급)", options: { bullet: true, breakLine: true, paraSpaceAfter: 7 } },
  { text: "분석기별 기여도 + 근거 자동 제시", options: { bullet: true, breakLine: true, paraSpaceAfter: 7 } },
  { text: "종/품종 baseline 기반 개인화", options: { bullet: true, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Python 패키지 + Streamlit 대시보드 완성", options: { bullet: true } },
], { x: 8.35, y: 2.6, w: 4.2, h: 3.4, fontFace: F, fontSize: 13, color: INK, margin: 0 });
s.addNotes("진행현황②. 8개 분석기가 하나의 통합 EWS로 융합되어 대시보드에 환자별로 표시됩니다. 중증도 밴드와 기여 분석기·근거가 자동 제시됩니다. 화면은 실제 데이터로 생성된 결과로, 이미 동작하는 산출물이라는 점을 강조하세요.");
footer(s, 10);

/* ---------- S11 KPI ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "KPI & Targets", "핵심성능지표(KPI) & 성과목표");
const head = (t) => ({ text: t, options: { fontFace: F, fontSize: 12.5, bold: true, color: WHITE, fill: { color: TEAL }, align: "center", valign: "middle" } });
const cell = (t, i, c) => ({ text: t, options: { fontFace: F, fontSize: 12, color: c || INK, fill: { color: i % 2 ? WHITE : PANEL }, valign: "middle", align: c ? "center" : "left" } });
const kpi = [
  [head("핵심성능지표(KPI)"), head("현재 (프로토타입)"), head("성과목표 (3차년)")],
  ["심박 추정 오차 (MAE)", "37.5 bpm", "< 5 bpm (검증)"],
  ["호흡수 추정 오차 (MAE)", "프록시 단계", "< 3 회/분"],
  ["악화 조기예측 (AUROC)", "EWS 골격", "≥ 0.85"],
  ["측정 활력·행동 지표 수", "8 축", "≥ 12 축 (IR/SpO₂ 포함)"],
  ["처리 지연 (실시간성)", "오프라인", "≤ 1 초 (준실시간)"],
  ["임상/검증 코호트", "7 클립(동물)", "다기관 ≥ 200 케이스"],
  ["인허가", "—", "SaMD 인허가 진입"],
];
const kt = kpi.map((r, ri) => r.map((cv, ci) => ri === 0 ? cv : cell(cv, ri, ci === 0 ? null : (ci === 1 ? MUT : TEAL))));
s.addTable(kt, { x: 0.55, y: 1.85, w: 12.2, colW: [5.0, 3.6, 3.6], rowH: 0.55, border: { pt: 1, color: LINEC }, align: "left", valign: "middle" });
s.addText("※ 현재 수치는 동물 데이터·영상 단위 라벨 기준 프로토타입 결과이며, 목표는 임상검증을 전제로 한 성과지표", { x: 0.55, y: 6.45, w: 12.2, h: 0.3, fontFace: F, fontSize: 10, color: MUT, italic: true, margin: 0 });
s.addNotes("핵심성능지표·성과목표. 현재 프로토타입 수치와 3차년 목표를 구분해 제시합니다. 목표(심박 MAE 5 미만, 악화예측 AUROC 0.85 이상, 다기관 200케이스 등)는 임상검증을 전제로 한 값임을 명확히 하고, 과장하지 않는 톤을 유지하세요.");
footer(s, 11);

/* ---------- S12 제품 3종+ ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Products", "개발 제품 — 3종 이상");
const prods = [
  ["P1", "비접촉 활력 분석 SW", "SaMD", "rPPG 기반 HR/RR/HRV/SpO₂ 분석 엔진. API·라이브러리 제공.", TEAL],
  ["P2", "통합 모니터링 플랫폼", "의료기기(HW+SW)", "다중 카메라 + 대시보드 + 통합 EWS. 병동/ICU/케이지 설치형.", ACCENT],
  ["P3", "정밀진단 DB + 진단보조 서비스", "DB·서비스", "활력·행동·라벨 DB와 EWS 리포트/알람 구독 서비스.", "1C7293"],
  ["P4", "반려동물 모니터링 제품", "시장 진입", "수의 ICU·동물병원용 패키지 (조기 사업화·데이터 확보).", "6D7C44"],
];
let px = 0.55;
prods.forEach((c) => {
  card(s, px, 1.95, 2.97, 4.05, WHITE);
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: px + 0.28, y: 2.25, w: 1.0, h: 0.6, rectRadius: 0.06, fill: { color: c[4] } });
  s.addText(c[0], { x: px + 0.28, y: 2.25, w: 1.0, h: 0.6, fontFace: F, fontSize: 16, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(c[1], { x: px + 0.28, y: 3.05, w: 2.5, h: 0.8, fontFace: F, fontSize: 14.5, color: INK, bold: true, lineSpacingMultiple: 1.0, margin: 0 });
  s.addText(c[2], { x: px + 0.28, y: 3.85, w: 2.5, h: 0.35, fontFace: F, fontSize: 11, color: c[4], bold: true, margin: 0 });
  s.addText(c[3], { x: px + 0.28, y: 4.25, w: 2.55, h: 1.6, fontFace: F, fontSize: 11.5, color: MUT, lineSpacingMultiple: 1.12, margin: 0 });
  px += 3.1;
});
s.addNotes("개발 제품 3종 이상. P1 비접촉 활력 분석 SW(SaMD), P2 다중카메라 통합 모니터링 플랫폼(의료기기), P3 정밀진단 DB+진단보조 서비스, P4 반려동물 모니터링 제품으로 시장 진입. 과제의 '제품 3종 이상' 요건을 초과 충족함을 짚으세요.");
footer(s, 12);

/* ---------- S13 사업화 전략 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Commercialization", "사업화 전략");
const biz = [
  ["진입 경로", "① 반려동물(수의) 시장 선진입 → ② 데이터·검증 확보 → ③ 인체 의료기기 확장", TEAL],
  ["수익 모델", "기기 판매 + SW 구독(SaMD) + 진단보조 서비스/API + DB 라이선스", ACCENT],
  ["목표 고객", "동물병원·동물 ICU → 대학·종합병원, 재택·요양, 신생아·중증 병동", "1C7293"],
  ["파트너십", "동물병원 네트워크, 대학병원 임상, 카메라/IR 센서 제조사, 클라우드", "6D7C44"],
];
yy = 1.85;
biz.forEach((r, i) => {
  card(s, 0.55, yy, 12.2, 1.05, i % 2 ? WHITE : PANEL);
  s.addText(r[0], { x: 0.85, y: yy, w: 2.5, h: 1.05, fontFace: F, fontSize: 15, color: r[2], bold: true, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 3.5, y: yy, w: 9.0, h: 1.05, fontFace: F, fontSize: 13.5, color: INK, valign: "middle", lineSpacingMultiple: 1.1, margin: 0 });
  yy += 1.18;
});
s.addNotes("사업화 전략. 수의 시장 선진입으로 검증·데이터를 확보하고 인체로 확장합니다. 수익모델은 기기 판매와 SW 구독(SaMD), 진단보조 서비스/API, DB 라이선스의 복합 구조. 동물병원 네트워크와 대학병원 임상, 센서·클라우드 파트너십을 강조하세요.");
footer(s, 13);

/* ---------- S14 로드맵 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Roadmap", "연구개발 & 사업화 로드맵");
s.addShape(p.shapes.LINE, { x: 0.85, y: 4.35, w: 11.9, h: 0, line: { color: LINEC, width: 2 } });
const phases = [
  ["1차년", "기술 고도화 · 데이터", ["코어 알고리즘 고도화", "검증 데이터셋 구축", "수의 베타 시범"], TEAL, 0.85],
  ["2차년", "임상검증 · 확장", ["다기관 임상검증", "IR/SpO₂ 모듈 통합", "악화예측 모델 학습"], ACCENT, 5.0],
  ["3차년", "인허가 · 사업화", ["SaMD 인허가 진입", "제품 3종 상용화", "인체 확장 PoC"], "1C7293", 9.15],
];
phases.forEach((ph) => {
  const x = ph[4];
  card(s, x, 1.75, 3.6, 2.25, WHITE);
  s.addText(ph[0], { x: x + 0.28, y: 1.92, w: 3.0, h: 0.4, fontFace: F, fontSize: 17, color: ph[3], bold: true, margin: 0 });
  s.addText(ph[1], { x: x + 0.28, y: 2.34, w: 3.1, h: 0.4, fontFace: F, fontSize: 12, color: INK, bold: true, margin: 0 });
  s.addText(ph[2].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 4, fontSize: 11 } })),
    { x: x + 0.28, y: 2.78, w: 3.1, h: 1.1, fontFace: F, color: MUT, margin: 0 });
  s.addShape(p.shapes.OVAL, { x: x + 1.6, y: 4.15, w: 0.4, h: 0.4, fill: { color: ph[3] } });
  s.addShape(p.shapes.LINE, { x: x + 1.8, y: 4.0, w: 0, h: 0.18, line: { color: LINEC, width: 1.5 } });
});
s.addText("정량 목표는 차년도별 KPI(슬라이드 11)에 연동", { x: 0.9, y: 6.4, w: 11, h: 0.35, fontFace: F, fontSize: 11, color: MUT, italic: true, margin: 0 });
s.addNotes("로드맵. 1차년은 코어 고도화와 검증 데이터셋 구축·수의 베타, 2차년은 다기관 임상검증과 IR/SpO₂ 모듈 통합·악화예측 학습, 3차년은 SaMD 인허가와 제품 3종 상용화·인체 확장 PoC. 각 단계의 정량 목표는 KPI 슬라이드와 연동됨을 언급하세요.");
footer(s, 14);

/* ---------- S15 기대효과 결론 ---------- */
s = p.addSlide(); s.background = { color: DARK };
s.addShape(p.shapes.OVAL, { x: -1.5, y: 4.6, w: 5, h: 5, fill: { color: TEAL, transparency: 80 } });
s.addText("기대효과 & 결론", { x: 0.8, y: 0.9, w: 11, h: 0.7, fontFace: F, fontSize: 28, color: WHITE, bold: true, margin: 0 });
s.addText([
  { text: "비접촉·연속·통합 모니터링으로 난치성·중증 환자의 악화를 조기 예측", options: { bullet: true, breakLine: true, paraSpaceAfter: 12 } },
  { text: "활력+행동 멀티모달 EWS로 단일 지표 한계 극복, 의사결정 지원", options: { bullet: true, breakLine: true, paraSpaceAfter: 12 } },
  { text: "플러그인 구조로 신규 지표·센서를 빠르게 확장 (제품 3종+ 확보)", options: { bullet: true, breakLine: true, paraSpaceAfter: 12 } },
  { text: "One-Health 전략: 수의 선진입 → 인체 정밀의료 확장", options: { bullet: true } },
], { x: 0.9, y: 2.1, w: 11.5, h: 3.0, fontFace: F, fontSize: 16, color: "DCEAEA", lineSpacingMultiple: 1.1, margin: 0 });
s.addText("이미 동작하는 프로토타입(8축 분석·통합 EWS·대시보드)을 기반으로, 임상검증과 인허가를 통해 제품화한다.", { x: 0.9, y: 5.6, w: 11.5, h: 0.8, fontFace: F, fontSize: 14, color: MINT, italic: true, bold: true, lineSpacingMultiple: 1.1, margin: 0 });
s.addNotes("결론. 비접촉·연속·통합 모니터링으로 악화를 조기 예측하고, 멀티모달 EWS로 단일 지표의 한계를 넘으며, 플러그인 구조로 빠르게 확장합니다. 이미 동작하는 프로토타입을 기반으로 임상검증·인허가를 거쳐 제품화한다는 메시지로 마무리하세요.");

/* ---------- S16 부록 한계/검증 ---------- */
s = p.addSlide(); s.background = { color: WHITE };
heading(s, "Appendix", "부록 — 현재 한계 & 검증 계획 (정직한 현황)");
const lim = [
  ["현재 한계", RED, [
    "정답이 영상 단위 OCR(거친 라벨) — 동기 ECG/PPG 부재",
    "단일 시점 휴리스틱 (누움/측와위 등 모호)",
    "IR 체온·SpO₂는 외부 센서 입력 필요 (자체 미보유)",
    "동물 7클립 규모 — 일반화 검증 부족",
  ]],
  ["검증·확보 계획", GRN, [
    "소규모라도 ECG/펄스옥시 동시측정 검증셋 구축",
    "프레임 라벨 확충 → ML 분류기 활성화",
    "열화상·다파장 모듈 통합 및 보정",
    "다기관·종 확장 코호트로 정량 검증",
  ]],
];
let lx = 0.55;
lim.forEach((c) => {
  card(s, lx, 1.9, 6.0, 4.2, WHITE);
  s.addShape(p.shapes.OVAL, { x: lx + 0.35, y: 2.2, w: 0.45, h: 0.45, fill: { color: c[1] } });
  s.addText(c[0], { x: lx + 0.95, y: 2.18, w: 4.8, h: 0.5, fontFace: F, fontSize: 16, color: INK, bold: true, valign: "middle", margin: 0 });
  s.addText(c[2].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 9 } })),
    { x: lx + 0.4, y: 2.85, w: 5.3, h: 3.0, fontFace: F, fontSize: 12.5, color: INK, lineSpacingMultiple: 1.1, margin: 0 });
  lx += 6.25;
});
s.addNotes("부록(질의 대비). 현재 한계를 솔직히 인정하세요: 영상 단위의 거친 라벨, 단일 시점 휴리스틱, IR·SpO₂ 자체 미보유, 동물 7클립의 소규모. 이에 대한 검증·확보 계획(ECG/펄스옥시 동시측정 검증셋, 프레임 라벨 확충, 센서 통합·보정, 다기관·종 확장 코호트)으로 답변하면 신뢰를 줍니다.");
footer(s, 16);

const out = path.join(__dirname, "AI_비접촉_정밀진단_모니터링_플랫폼_제안.pptx");
p.writeFile({ fileName: out }).then(() => console.log("WROTE", out));
