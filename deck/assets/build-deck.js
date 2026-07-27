const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const ICON_DIR = path.join(__dirname, 'icons');
const DIAGRAM_DIR = path.join(__dirname, 'diagrams');
const OUT_PATH = path.join(__dirname, '..', 'Accommodation-Booking-Solution-Discovery-Presentation.pptx');

function icon(name) {
  const p = path.join(ICON_DIR, `${name}.png`);
  if (!fs.existsSync(p)) throw new Error(`Missing icon: ${name}`);
  return p;
}

// ---------------------------------------------------------------------------
// Sodexo brand palette (matches plantuml/sodexo-theme.puml)
// ---------------------------------------------------------------------------
const C = {
  blue: '2B3797',
  blueDark: '202A78',
  blueLight: 'DDE1F6',
  bluePale: 'F5F6FC',
  red: 'ED1C24',
  redLight: 'FBDADD',
  ink: '1A2040',
  muted: '5F6685',
  border: 'C9CEE8',
  white: 'FFFFFF',
  success: '187A5A',
  successLight: 'DDF2E9',
  warning: '9A5A00',
  warningLight: 'FFF4DD',
};

const FONT_HEAD = 'Cambria';
const FONT_BODY = 'Calibri';

const PAGE_W = 13.333;
const PAGE_H = 7.5;
const MARGIN = 0.6;

// ---------------------------------------------------------------------------
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Mohit Kanwar';
pres.company = 'Sodexo';
pres.title = 'Accommodation Booking Solution — Initial Discovery';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function newSlide(bg) {
  const slide = pres.addSlide();
  slide.background = { color: bg || C.white };
  return slide;
}

/** Small kicker + big title used at the top of every content slide. */
function addHeader(slide, kicker, title, opts) {
  opts = opts || {};
  const dark = !!opts.dark;
  slide.addText(kicker.toUpperCase(), {
    x: MARGIN,
    y: 0.42,
    w: 10,
    h: 0.32,
    fontFace: FONT_BODY,
    fontSize: 12,
    bold: true,
    color: dark ? C.blueLight : C.blue,
    charSpacing: 2,
    margin: 0,
  });
  slide.addText(title, {
    x: MARGIN,
    y: 0.72,
    w: PAGE_W - MARGIN * 2,
    h: 0.75,
    fontFace: FONT_HEAD,
    fontSize: 30,
    bold: true,
    color: dark ? C.white : C.blueDark,
    margin: 0,
  });
}

/** Icon glyph centred inside a filled circle. */
function addIconCircle(slide, cx, cy, d, circleColor, iconName, iconScale) {
  iconScale = iconScale || 0.55;
  slide.addShape(pres.ShapeType.ellipse, {
    x: cx - d / 2,
    y: cy - d / 2,
    w: d,
    h: d,
    fill: { color: circleColor },
    line: { type: 'none' },
  });
  const iw = d * iconScale;
  slide.addImage({
    path: icon(iconName),
    x: cx - iw / 2,
    y: cy - iw / 2,
    w: iw,
    h: iw,
  });
}

function footer(slide, pageNum) {
  slide.addText('Accommodation Booking Solution · Initial Discovery', {
    x: MARGIN,
    y: PAGE_H - 0.42,
    w: 8,
    h: 0.3,
    fontFace: FONT_BODY,
    fontSize: 9,
    color: C.muted,
    margin: 0,
  });
  slide.addText(String(pageNum), {
    x: PAGE_W - MARGIN - 0.6,
    y: PAGE_H - 0.42,
    w: 0.6,
    h: 0.3,
    fontFace: FONT_BODY,
    fontSize: 9,
    color: C.muted,
    align: 'right',
    margin: 0,
  });
}

let PAGE = 0;
function nextPage() {
  PAGE += 1;
  return PAGE;
}

/** A simple content card: icon + title + one-line description. */
function addCard(slide, x, y, w, h, iconName, title, desc, accent) {
  accent = accent || C.blue;
  slide.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: C.bluePale },
    line: { type: 'none' },
    shadow: {
      type: 'outer',
      color: '9AA5D9',
      opacity: 0.35,
      blur: 6,
      offset: 2,
      angle: 90,
    },
  });
  const d = 0.5;
  addIconCircle(slide, x + 0.4, y + 0.45, d, accent, iconName, 0.5);
  slide.addText(title, {
    x: x + 0.75,
    y: y + 0.18,
    w: w - 0.95,
    h: 0.35,
    fontFace: FONT_BODY,
    fontSize: 14,
    bold: true,
    color: C.ink,
    margin: 0,
    valign: 'middle',
  });
  slide.addText(desc, {
    x: x + 0.3,
    y: y + 0.75,
    w: w - 0.6,
    h: h - 0.95,
    fontFace: FONT_BODY,
    fontSize: 11,
    color: C.muted,
    margin: 0,
    valign: 'top',
    lineSpacingMultiple: 1.12,
  });
}

/** Bulleted list block with a colored heading. */
function addBulletBlock(slide, x, y, w, h, heading, items, opts) {
  opts = opts || {};
  const headColor = opts.headColor || C.blue;
  slide.addText(heading, {
    x,
    y,
    w,
    h: 0.35,
    fontFace: FONT_BODY,
    fontSize: 15,
    bold: true,
    color: headColor,
    margin: 0,
  });
  const paras = items.map((t, i) => ({
    text: t,
    options: {
      bullet: { code: '25AA', indent: 14 },
      color: C.ink,
      fontSize: opts.fontSize || 12.5,
      breakLine: i < items.length - 1,
      paraSpaceAfter: 8,
    },
  }));
  slide.addText(paras, {
    x,
    y: y + 0.42,
    w,
    h: h - 0.42,
    fontFace: FONT_BODY,
    margin: 0,
    valign: 'top',
    lineSpacingMultiple: 1.08,
  });
}

/**
 * A "combined journey" slide: a horizontal spine of primary-path milestones,
 * with one or more labeled clusters of supporting-action chips dropping from
 * specific spine milestones. Used to summarize many small journey diagrams
 * (which don't fit individually on a slide) into a single map.
 *
 * spine: array of [iconName, label, fillColor]
 * clusters: array of { label, labelColor, fromSpineIndex, labelY, rowY, items, chipColor }
 *   items: array of [iconName, label, chipColorOverride?]
 */
function lifecycleJourneySlide(kicker, title, intro, spine, clusters) {
  const slide = newSlide(C.white);
  addHeader(slide, kicker, title);

  slide.addText(intro, {
    x: MARGIN,
    y: 1.55,
    w: PAGE_W - MARGIN * 2,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 12.5,
    color: C.muted,
    margin: 0,
  });

  const spineY = 1.75;
  const spineH = 0.95;
  const spineGap = 0.32;
  const spineW = (PAGE_W - MARGIN * 2 - spineGap * (spine.length - 1)) / spine.length;

  function milestoneX(i) {
    return MARGIN + i * (spineW + spineGap);
  }

  spine.forEach((s, i) => {
    const x = milestoneX(i);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: spineY,
      w: spineW,
      h: spineH,
      rectRadius: 0.1,
      fill: { color: s[2] },
      line: { type: 'none' },
    });
    const iconD = 0.42;
    slide.addImage({
      path: icon(s[0]),
      x: x + 0.22,
      y: spineY + spineH / 2 - iconD / 2,
      w: iconD,
      h: iconD,
    });
    slide.addText(s[1], {
      x: x + 0.22 + iconD + 0.12,
      y: spineY,
      w: spineW - (0.22 + iconD + 0.12) - 0.15,
      h: spineH,
      fontFace: FONT_BODY,
      fontSize: 12.5,
      bold: true,
      color: C.white,
      valign: 'middle',
      margin: 0,
      lineSpacingMultiple: 1.05,
    });
    if (i < spine.length - 1) {
      slide.addShape(pres.ShapeType.rightArrow, {
        x: x + spineW + 0.02,
        y: spineY + spineH / 2 - 0.11,
        w: spineGap - 0.04,
        h: 0.22,
        fill: { color: C.border },
        line: { type: 'none' },
      });
    }
  });

  function dropConnector(spineIndex, toY) {
    const x = milestoneX(spineIndex) + spineW / 2;
    slide.addShape(pres.ShapeType.line, {
      x,
      y: spineY + spineH,
      w: 0,
      h: toY - (spineY + spineH),
      line: { color: C.border, width: 2, dashType: 'dash' },
    });
  }

  function actionRow(y, items, chipColor) {
    const gap = 0.3;
    const w = (PAGE_W - MARGIN * 2 - gap * (items.length - 1)) / items.length;
    const h = 1.15;
    items.forEach((it, i) => {
      const x = MARGIN + i * (w + gap);
      slide.addShape(pres.ShapeType.roundRect, {
        x,
        y,
        w,
        h,
        rectRadius: 0.08,
        fill: { color: C.bluePale },
        line: { type: 'none' },
      });
      addIconCircle(slide, x + w / 2, y + 0.34, 0.48, it[2] || chipColor, it[0], 0.5);
      slide.addText(it[1], {
        x: x + 0.12,
        y: y + 0.62,
        w: w - 0.24,
        h: h - 0.7,
        fontFace: FONT_BODY,
        fontSize: 10.5,
        bold: true,
        color: C.ink,
        align: 'center',
        valign: 'top',
        margin: 0,
        lineSpacingMultiple: 1.05,
      });
    });
  }

  clusters.forEach((cl) => {
    dropConnector(cl.fromSpineIndex, cl.labelY - 0.05);
    slide.addText(cl.label, {
      x: MARGIN,
      y: cl.labelY,
      w: PAGE_W - MARGIN * 2,
      h: 0.3,
      fontFace: FONT_BODY,
      fontSize: 11,
      bold: true,
      color: cl.labelColor || C.blueDark,
      charSpacing: 1,
      align: 'center',
      margin: 0,
    });
    actionRow(cl.rowY, cl.items, cl.chipColor);
  });

  footer(slide, nextPage());
  return slide;
}

/**
 * A "capability map" slide: a single hub node with two clusters of related
 * capabilities laid out side by side beneath it. Used for roles whose
 * documented scenarios are independent, ongoing capabilities rather than one
 * sequential journey.
 *
 * hub: [iconName, label, fillColor]
 * clusterA / clusterB: { label, labelColor, chipColor, items: [[iconName, label]] }
 */
function capabilityMapSlide(kicker, title, intro, hub, clusterA, clusterB) {
  const slide = newSlide(C.white);
  addHeader(slide, kicker, title);

  slide.addText(intro, {
    x: MARGIN,
    y: 1.55,
    w: PAGE_W - MARGIN * 2,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 12.5,
    color: C.muted,
    margin: 0,
  });

  const hubW = 4.4;
  const hubH = 0.85;
  const hubX = (PAGE_W - hubW) / 2;
  const hubY = 2.0;
  slide.addShape(pres.ShapeType.roundRect, {
    x: hubX,
    y: hubY,
    w: hubW,
    h: hubH,
    rectRadius: 0.1,
    fill: { color: hub[2] },
    line: { type: 'none' },
  });
  const iconD = 0.44;
  slide.addImage({
    path: icon(hub[0]),
    x: hubX + 0.28,
    y: hubY + hubH / 2 - iconD / 2,
    w: iconD,
    h: iconD,
  });
  slide.addText(hub[1], {
    x: hubX + 0.28 + iconD + 0.15,
    y: hubY,
    w: hubW - (0.28 + iconD + 0.15) - 0.2,
    h: hubH,
    fontFace: FONT_BODY,
    fontSize: 14,
    bold: true,
    color: C.white,
    valign: 'middle',
    margin: 0,
  });

  const half = (PAGE_W - MARGIN * 2 - 0.5) / 2;
  const clusterY = 3.35;
  const clusterH = 3.35;

  function connector(toX) {
    slide.addShape(pres.ShapeType.line, {
      x: PAGE_W / 2,
      y: hubY + hubH,
      w: toX - PAGE_W / 2,
      h: clusterY - (hubY + hubH),
      line: { color: C.border, width: 2, dashType: 'dash' },
    });
  }

  function cluster(x, cl) {
    connector(x + half / 2);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: clusterY,
      w: half,
      h: clusterH,
      rectRadius: 0.1,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    slide.addText(cl.label, {
      x: x + 0.3,
      y: clusterY + 0.2,
      w: half - 0.6,
      h: 0.4,
      fontFace: FONT_BODY,
      fontSize: 12.5,
      bold: true,
      color: cl.labelColor || C.blueDark,
      charSpacing: 0.5,
      margin: 0,
    });
    const itemH = (clusterH - 0.75) / cl.items.length;
    cl.items.forEach((it, i) => {
      const y = clusterY + 0.7 + i * itemH;
      addIconCircle(slide, x + 0.55, y + itemH / 2 - 0.02, 0.42, cl.chipColor || C.blue, it[0], 0.5);
      slide.addText(it[1], {
        x: x + 0.92,
        y,
        w: half - 1.2,
        h: itemH,
        fontFace: FONT_BODY,
        fontSize: 12,
        color: C.ink,
        valign: 'middle',
        margin: 0,
        lineSpacingMultiple: 1.05,
      });
    });
  }

  cluster(MARGIN, clusterA);
  cluster(MARGIN + half + 0.5, clusterB);

  footer(slide, nextPage());
  return slide;
}

// ---------------------------------------------------------------------------
// 1. TITLE
// ---------------------------------------------------------------------------
(function titleSlide() {
  const slide = newSlide(C.blueDark);
  slide.background = { color: C.blue };

  // subtle depth panel
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: PAGE_W,
    h: PAGE_H,
    fill: { color: C.blue },
    line: { type: 'none' },
  });
  slide.addShape(pres.ShapeType.ellipse, {
    x: PAGE_W - 4.6,
    y: -2.2,
    w: 6.5,
    h: 6.5,
    fill: { color: C.blueDark },
    line: { type: 'none' },
  });
  slide.addShape(pres.ShapeType.ellipse, {
    x: -2.6,
    y: PAGE_H - 2.6,
    w: 5,
    h: 5,
    fill: { color: C.blueDark },
    line: { type: 'none' },
  });

  // logo mark (rounded square + skyline, matches the site favicon)
  const lx = MARGIN;
  const ly = 0.6;
  const ls = 0.62;
  slide.addShape(pres.ShapeType.roundRect, {
    x: lx,
    y: ly,
    w: ls,
    h: ls,
    rectRadius: 0.12,
    fill: { color: C.white },
    line: { type: 'none' },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: lx + ls * 0.16,
    y: ly + ls * 0.6,
    w: ls * 0.68,
    h: ls * 0.22,
    fill: { color: C.blue },
    line: { type: 'none' },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: lx + ls * 0.16,
    y: ly + ls * 0.53,
    w: ls * 0.68,
    h: ls * 0.09,
    fill: { color: C.red },
    line: { type: 'none' },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: lx + ls * 0.2,
    y: ly + ls * 0.28,
    w: ls * 0.22,
    h: ls * 0.25,
    fill: { color: C.blue },
    line: { type: 'none' },
  });
  slide.addShape(pres.ShapeType.rect, {
    x: lx + ls * 0.5,
    y: ly + ls * 0.16,
    w: ls * 0.22,
    h: ls * 0.37,
    fill: { color: C.blue },
    line: { type: 'none' },
  });

  slide.addText('SODEXO', {
    x: lx + ls + 0.2,
    y: ly,
    w: 4,
    h: ls,
    fontFace: FONT_BODY,
    fontSize: 20,
    bold: true,
    color: C.white,
    charSpacing: 3,
    valign: 'middle',
    margin: 0,
  });

  slide.addText('Accommodation Booking Solution', {
    x: MARGIN,
    y: 2.9,
    w: PAGE_W - MARGIN * 2,
    h: 1.6,
    fontFace: FONT_HEAD,
    fontSize: 44,
    bold: true,
    color: C.white,
    margin: 0,
  });
  slide.addText('Initial Discovery Presentation', {
    x: MARGIN,
    y: 4.25,
    w: 10,
    h: 0.55,
    fontFace: FONT_BODY,
    fontSize: 20,
    color: C.blueLight,
    margin: 0,
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: MARGIN,
    y: 5.05,
    w: 2.55,
    h: 0.5,
    rectRadius: 0.25,
    fill: { color: C.blueDark },
    line: { type: 'none' },
  });
  slide.addText('60-minute session', {
    x: MARGIN,
    y: 5.05,
    w: 2.55,
    h: 0.5,
    fontFace: FONT_BODY,
    fontSize: 13,
    bold: true,
    color: C.white,
    align: 'center',
    valign: 'middle',
    margin: 0,
  });

  slide.addText('For business owners, product owners, operations, and technology teams', {
    x: MARGIN,
    y: 6.55,
    w: 9,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 12,
    italic: true,
    color: C.blueLight,
    margin: 0,
  });
})();

// ---------------------------------------------------------------------------
// 2. PURPOSE & DESIRED OUTCOMES
// ---------------------------------------------------------------------------
(function purposeSlide() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Why we are here', 'Purpose of this session');

  slide.addText(
    'Build a shared understanding of Tetrapak’s request, expose the decisions ' +
      'that determine scope and feasibility, and agree the work required to reach ' +
      'delivery readiness.',
    {
      x: MARGIN,
      y: 1.65,
      w: PAGE_W - MARGIN * 2,
      h: 0.9,
      fontFace: FONT_BODY,
      fontSize: 16,
      color: C.ink,
      margin: 0,
      lineSpacingMultiple: 1.2,
    }
  );

  slide.addShape(pres.ShapeType.roundRect, {
    x: MARGIN,
    y: 2.55,
    w: PAGE_W - MARGIN * 2,
    h: 0.55,
    rectRadius: 0.08,
    fill: { color: C.warningLight },
    line: { type: 'none' },
  });
  slide.addText(
    'This is not a final solution design or delivery commitment — the data model, flows, and principles are initial hypotheses to support discussion.',
    {
      x: MARGIN + 0.25,
      y: 2.55,
      w: PAGE_W - MARGIN * 2 - 0.5,
      h: 0.55,
      fontFace: FONT_BODY,
      fontSize: 12.5,
      italic: true,
      color: C.warning,
      valign: 'middle',
      margin: 0,
    }
  );

  slide.addText('DESIRED OUTCOMES', {
    x: MARGIN,
    y: 3.35,
    w: 6,
    h: 0.35,
    fontFace: FONT_BODY,
    fontSize: 13,
    bold: true,
    color: C.blue,
    charSpacing: 1.5,
    margin: 0,
  });

  const outcomes = [
    ['target', 'Agreement on scope', 'What problem the feature solves for Tetrapak employees'],
    ['helpCircle', 'A visible list of unknowns', 'Business, product, commercial, and technical questions'],
    ['checkCircle', 'Domain boundaries tested', 'Acceptance or challenge of the initial domain and integrations'],
    ['flag', 'Named owners', 'For validation workshops and blocking decisions'],
  ];
  const cw = (PAGE_W - MARGIN * 2 - 0.45 * 3) / 4;
  outcomes.forEach((o, i) => {
    const x = MARGIN + i * (cw + 0.45);
    addCard(slide, x, 3.8, cw, 2.9, o[0], o[1], o[2], i % 2 === 0 ? C.blue : C.blueDark);
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// 3. AGENDA
// ---------------------------------------------------------------------------
(function agendaSlide() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Roadmap for the next hour', 'Agenda');

  const items = [
    ['Context and understanding', '5 min'],
    ['Discovery questions', '12 min'],
    ['Initial data model', '10 min'],
    ['High-level API flow', '10 min'],
    ['Architecture principles', '8 min'],
    ['Next steps and workshops', '5 min'],
    ['Q&A and decision recap', '10 min'],
  ];

  const top = 1.75;
  const rowH = 0.66;
  const leftX = MARGIN + 0.25;
  // connecting line
  slide.addShape(pres.ShapeType.line, {
    x: leftX + 0.22,
    y: top + 0.22,
    w: 0,
    h: rowH * (items.length - 1),
    line: { color: C.border, width: 2, dashType: 'solid' },
  });

  items.forEach((it, i) => {
    const y = top + i * rowH;
    const isLast = i === items.length - 1;
    slide.addShape(pres.ShapeType.ellipse, {
      x: leftX,
      y,
      w: 0.44,
      h: 0.44,
      fill: { color: isLast ? C.blueDark : C.blue },
      line: { type: 'none' },
    });
    slide.addText(String(i + 1), {
      x: leftX,
      y,
      w: 0.44,
      h: 0.44,
      fontFace: FONT_BODY,
      fontSize: 13,
      bold: true,
      color: C.white,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });
    slide.addText(it[0], {
      x: leftX + 0.7,
      y: y - 0.03,
      w: 8.6,
      h: 0.5,
      fontFace: FONT_BODY,
      fontSize: 16,
      bold: true,
      color: C.ink,
      valign: 'middle',
      margin: 0,
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: PAGE_W - MARGIN - 1.5,
      y: y - 0.02,
      w: 1.15,
      h: 0.42,
      rectRadius: 0.21,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    slide.addText(it[1], {
      x: PAGE_W - MARGIN - 1.5,
      y: y - 0.02,
      w: 1.15,
      h: 0.42,
      fontFace: FONT_BODY,
      fontSize: 12,
      bold: true,
      color: C.blueDark,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });
  });

  slide.addText('Total: 60 minutes', {
    x: leftX + 0.7,
    y: top + items.length * rowH + 0.05,
    w: 6,
    h: 0.35,
    fontFace: FONT_BODY,
    fontSize: 12,
    italic: true,
    color: C.muted,
    margin: 0,
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// Section divider factory
// ---------------------------------------------------------------------------
function sectionDivider(num, title, minutes, iconName) {
  const slide = newSlide(C.blue);
  slide.addShape(pres.ShapeType.ellipse, {
    x: PAGE_W - 4.2,
    y: PAGE_H - 4.2,
    w: 6,
    h: 6,
    fill: { color: C.blueDark },
    line: { type: 'none' },
  });

  slide.addText(num, {
    x: MARGIN,
    y: 2.2,
    w: 3.2,
    h: 2.2,
    fontFace: FONT_HEAD,
    fontSize: 110,
    bold: true,
    color: C.blueDark,
    margin: 0,
  });
  addIconCircle(slide, MARGIN + 4.55, 3.28, 1.05, C.blueDark, iconName, 0.5);
  slide.addText(title, {
    x: MARGIN + 5.25,
    y: 2.75,
    w: 7.3,
    h: 1.1,
    fontFace: FONT_HEAD,
    fontSize: 32,
    bold: true,
    color: C.white,
    valign: 'middle',
    margin: 0,
  });
  slide.addText(minutes, {
    x: MARGIN + 5.25,
    y: 3.85,
    w: 7.3,
    h: 0.5,
    fontFace: FONT_BODY,
    fontSize: 15,
    color: C.blueLight,
    margin: 0,
  });
  footer(slide, nextPage());
  return slide;
}

// ---------------------------------------------------------------------------
// SECTION 1 — Context and Understanding
// ---------------------------------------------------------------------------
sectionDivider('01', 'Context and Understanding', '5 minutes', 'compass');

(function whatWeHeard() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 1 · Context and understanding', 'What we heard');

  slide.addText(
    'Tetrapak wants eligible employees travelling between offices to request accommodation inside the existing Sodexo B2C application.',
    {
      x: MARGIN,
      y: 1.6,
      w: PAGE_W - MARGIN * 2,
      h: 0.6,
      fontFace: FONT_BODY,
      fontSize: 15,
      color: C.ink,
      margin: 0,
    }
  );

  const items = [
    ['layers', 'The employee experience is a React micro frontend, composed as a B2C Lego.'],
    ['lock', 'Existing B2C authentication identifies the employee and client.'],
    ['globe', 'Available accommodation comes from Booking.com.'],
    ['mapPin', 'Eligibility and price limits vary by client, employee level, and destination.'],
    ['userCheck', 'A dedicated Tetrapak operator reviews requests and creates the real booking.'],
    ['settings', 'An administration capability manages destinations, role levels, policies, and technical configuration.'],
  ];
  const colW = (PAGE_W - MARGIN * 2 - 0.4) / 2;
  items.forEach((it, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * (colW + 0.4);
    const y = 2.35 + row * 1.35;
    addIconCircle(slide, x + 0.3, y + 0.32, 0.56, col === 0 ? C.blue : C.blueDark, it[0], 0.5);
    slide.addText(it[1], {
      x: x + 0.7,
      y: y,
      w: colW - 0.7,
      h: 1.1,
      fontFace: FONT_BODY,
      fontSize: 13,
      color: C.ink,
      valign: 'top',
      margin: 0,
      lineSpacingMultiple: 1.15,
    });
  });

  footer(slide, nextPage());
})();

(function corporateLandscape() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 1 · Context and understanding', 'The accommodation ecosystem');

  slide.addText(
    'Multiple client corporations and multiple provider corporations, coordinated by Sodexo. Every corporation keeps its own users and organisational boundary.',
    {
      x: MARGIN,
      y: 1.55,
      w: PAGE_W - MARGIN * 2,
      h: 0.5,
      fontFace: FONT_BODY,
      fontSize: 13.5,
      color: C.muted,
      margin: 0,
    }
  );

  const imgPath = path.join(DIAGRAM_DIR, 'corporate-user-landscape.png');
  const imgW = 8.6;
  const imgH = imgW * (1869 / 3489);
  slide.addImage({
    path: imgPath,
    x: (PAGE_W - imgW) / 2,
    y: 2.05,
    w: imgW,
    h: imgH,
  });

  footer(slide, nextPage());
})();

(function sixRoles() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 1 · Context and understanding', 'Six roles across three groups');

  const groups = [
    {
      label: 'CLIENT CORPORATION',
      color: C.blue,
      roles: [
        ['user', 'Traveller', 'Searches, submits requests, tracks outcomes'],
        ['userCheck', 'Approver', 'Approves, rejects, or seeks clarification'],
        ['settings', 'Corporate Administrator', 'Manages policy, roles, destinations, price'],
      ],
    },
    {
      label: 'SODEXO',
      color: C.blueDark,
      roles: [
        ['briefcase', 'Booking Operator', 'Validates requests, creates the reservation'],
        ['shield', 'Sodexo Administrator', 'Manages tenants, integrations, reporting'],
      ],
    },
    {
      label: 'SUPPLIER CORPORATION',
      color: C.red,
      roles: [
        ['home', 'Accommodation Provider Agent', 'Fulfils reservations, manages content'],
      ],
    },
  ];

  const gw = (PAGE_W - MARGIN * 2 - 0.4 * 2) / 3;
  let gx = MARGIN;
  groups.forEach((g) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: gx,
      y: 1.65,
      w: gw,
      h: 5.15,
      rectRadius: 0.1,
      fill: { color: C.bluePale },
      line: { color: C.border, width: 1 },
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: gx,
      y: 1.65,
      w: gw,
      h: 0.55,
      rectRadius: 0.1,
      fill: { color: g.color },
      line: { type: 'none' },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: gx,
      y: 1.65 + 0.28,
      w: gw,
      h: 0.27,
      fill: { color: g.color },
      line: { type: 'none' },
    });
    slide.addText(g.label, {
      x: gx + 0.15,
      y: 1.65,
      w: gw - 0.3,
      h: 0.55,
      fontFace: FONT_BODY,
      fontSize: 12,
      bold: true,
      color: C.white,
      valign: 'middle',
      charSpacing: 1,
      margin: 0,
    });

    let ry = 2.5;
    g.roles.forEach((r) => {
      addIconCircle(slide, gx + 0.45, ry + 0.4, 0.5, g.color, r[0], 0.5);
      slide.addText(r[1], {
        x: gx + 0.82,
        y: ry,
        w: gw - 1.0,
        h: 0.5,
        fontFace: FONT_BODY,
        fontSize: 12.5,
        bold: true,
        color: C.ink,
        margin: 0,
        valign: 'top',
        lineSpacingMultiple: 1.05,
      });
      slide.addText(r[2], {
        x: gx + 0.82,
        y: ry + 0.52,
        w: gw - 1.0,
        h: 0.62,
        fontFace: FONT_BODY,
        fontSize: 10.5,
        color: C.muted,
        margin: 0,
        lineSpacingMultiple: 1.1,
      });
      ry += 1.5;
    });

    gx += gw + 0.4;
  });

  footer(slide, nextPage());
})();

lifecycleJourneySlide(
  'Section 1 · Context and understanding',
  'Traveller journey, combined',
  'All eight traveller journeys, in one map — the primary path plus every supporting action available at each stage.',
  [
    ['logIn', 'Sign in & search', C.blue],
    ['arrowRight', 'Submit request', C.blue],
    ['clock', 'Awaiting approval', C.blueDark],
    ['checkCircle', 'Confirmed & booked', C.success],
  ],
  [
    {
      label: 'WHILE AWAITING APPROVAL, THE TRAVELLER CAN',
      labelColor: C.blueDark,
      fromSpineIndex: 2,
      labelY: 2.98,
      rowY: 3.35,
      chipColor: C.blue,
      items: [
        ['eye', 'View request status & details'],
        ['fileText', 'Edit destination, dates, or requirements'],
        ['messageSquare', 'Send a follow-up reminder'],
        ['xCircle', 'Cancel the request', C.warning],
      ],
    },
    {
      label: 'ONCE CONFIRMED, THE TRAVELLER CAN',
      labelColor: C.success,
      fromSpineIndex: 3,
      labelY: 4.85,
      rowY: 5.22,
      chipColor: C.success,
      items: [
        ['download', 'Download or email the confirmation letter'],
        ['phone', 'View accommodation contact details'],
        ['alertTriangle', 'Raise a booking issue', C.warning],
      ],
    },
  ]
);

lifecycleJourneySlide(
  'Section 1 · Context and understanding',
  'Approver journey, combined',
  'All six approver journeys, in one map — manage the queue, review the request, then decide.',
  [
    ['clipboard', 'Manage approval queue', C.blue],
    ['eye', 'Review request & policy', C.blue],
    ['gitBranch', 'Decide', C.blueDark],
  ],
  [
    {
      label: 'THE APPROVER CAN THEN',
      labelColor: C.blueDark,
      fromSpineIndex: 2,
      labelY: 3.05,
      rowY: 3.45,
      chipColor: C.blue,
      items: [
        ['checkCircle', 'Approve the request', C.success],
        ['xCircle', 'Reject the request', C.warning],
        ['messageSquare', 'Seek clarification'],
        ['refreshCw', 'Reassess a changed offer'],
      ],
    },
  ]
);

lifecycleJourneySlide(
  'Section 1 · Context and understanding',
  'Booking Operator journey, combined',
  'All seven booking operator journeys, in one map — manage the queue, validate and create the booking, then handle what follows.',
  [
    ['clipboard', 'Manage booking queue', C.blue],
    ['checkCircle', 'Validate & create booking', C.blue],
    ['home', 'Reservation confirmed', C.success],
  ],
  [
    {
      label: 'WHEN SOMETHING CHANGES DURING BOOKING',
      labelColor: C.blueDark,
      fromSpineIndex: 1,
      labelY: 2.98,
      rowY: 3.35,
      chipColor: C.blue,
      items: [
        ['refreshCw', 'Handle a changed price or offer'],
        ['alertTriangle', 'Resolve a failed or uncertain booking', C.warning],
      ],
    },
    {
      label: 'ADDITIONAL OPERATOR RESPONSIBILITIES',
      labelColor: C.success,
      fromSpineIndex: 2,
      labelY: 4.85,
      rowY: 5.22,
      chipColor: C.success,
      items: [
        ['fileText', 'Amend or cancel a reservation'],
        ['helpCircle', 'Investigate a booking issue', C.warning],
        ['userCheck', 'Create a request on behalf of a traveller'],
      ],
    },
  ]
);

lifecycleJourneySlide(
  'Section 1 · Context and understanding',
  'Accommodation Provider Agent journey, combined',
  'All six provider agent journeys, in one map — configure the property, fulfil the stay, then follow through.',
  [
    ['settings', 'Manage configuration', C.blue],
    ['home', 'Receive & fulfil reservation', C.blue],
    ['checkCircle', 'Stay complete', C.success],
  ],
  [
    {
      label: 'DURING THE STAY',
      labelColor: C.blueDark,
      fromSpineIndex: 1,
      labelY: 2.98,
      rowY: 3.35,
      chipColor: C.blue,
      items: [
        ['fileText', 'Process an amendment or cancellation'],
        ['helpCircle', 'Provide booking support', C.warning],
      ],
    },
    {
      label: 'AFTER THE STAY',
      labelColor: C.success,
      fromSpineIndex: 2,
      labelY: 4.85,
      rowY: 5.22,
      chipColor: C.success,
      items: [
        ['dollarSign', 'Provide invoices & settlement information'],
        ['refreshCw', 'Resolve a reconciliation discrepancy'],
      ],
    },
  ]
);

capabilityMapSlide(
  'Section 1 · Context and understanding',
  'Corporate Administrator capabilities, combined',
  'All seven corporate administrator journeys, in one map — grouped by what they manage, not a single sequence.',
  ['settings', 'Corporate Administrator', C.blueDark],
  {
    label: 'POLICY & ACCESS CONFIGURATION',
    labelColor: C.blueDark,
    chipColor: C.blue,
    items: [
      ['clipboard', 'Manage travel policies'],
      ['users', 'Manage corporate roles & assignments'],
      ['mapPin', 'Manage destinations & corporate sites'],
      ['dollarSign', 'Manage price ranges & exceptions'],
    ],
  },
  {
    label: 'BILLING & REPORTING',
    labelColor: C.success,
    chipColor: C.success,
    items: [
      ['fileText', 'Validate accommodation bills'],
      ['checkCircle', 'Approve and make payments'],
      ['barChart', 'Review spend, compliance & audit reports'],
    ],
  }
);

capabilityMapSlide(
  'Section 1 · Context and understanding',
  'Sodexo Administrator capabilities, combined',
  'All seven Sodexo administrator journeys, in one map — grouped by what they manage, not a single sequence.',
  ['shield', 'Sodexo Administrator', C.blueDark],
  {
    label: 'SET UP & CONFIGURE',
    labelColor: C.blueDark,
    chipColor: C.blue,
    items: [
      ['flag', 'Onboard a corporate tenant'],
      ['lock', 'Manage platform roles & access'],
      ['link', 'Configure supplier integrations'],
    ],
  },
  {
    label: 'OPERATE & SUPPORT',
    labelColor: C.success,
    chipColor: C.success,
    items: [
      ['eye', 'Monitor booking & approval operations'],
      ['refreshCw', 'Resolve reconciliation exceptions'],
      ['barChart', 'Generate operational & audit reports'],
      ['helpCircle', 'Support a controlled investigation', C.warning],
    ],
  }
);

(function systemContext() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 1 · Context and understanding', 'System context, simplified');

  // Two "users" boxes on the left
  const userBoxW = 2.0;
  const boxH = 0.85;

  function box(x, y, w, h, fillColor, textColor, label, sub, bold) {
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      rectRadius: 0.08,
      fill: { color: fillColor },
      line: { type: 'none' },
    });
    slide.addText(
      [
        { text: label, options: { bold: true, fontSize: bold || 12, breakLine: true } },
        { text: sub || '', options: { fontSize: 9.5, color: textColor === C.white ? C.blueLight : C.muted } },
      ],
      {
        x: x + 0.12,
        y,
        w: w - 0.24,
        h,
        fontFace: FONT_BODY,
        color: textColor,
        valign: 'middle',
        align: 'center',
        margin: 0,
        lineSpacingMultiple: 1.05,
      }
    );
  }

  const leftX = MARGIN;
  box(leftX, 1.85, userBoxW, boxH, C.bluePale, C.ink, 'Customer Users', 'Traveller, Approver, Admin');
  box(leftX, 3.0, userBoxW, boxH, C.blue, C.white, 'Sodexo Users', 'Admin, Operator');

  const midX = leftX + userBoxW + 0.55;
  box(midX, 1.85, userBoxW, boxH, C.bluePale, C.ink, 'Sodexo B2C App', 'Existing host + Lego');
  box(midX, 3.0, userBoxW, boxH, C.blue, C.white, 'Admin Application', 'Sodexo employee webapp');

  const coreX = midX + userBoxW + 0.55;
  const coreW = 2.5;
  slide.addShape(pres.ShapeType.roundRect, {
    x: coreX,
    y: 2.1,
    w: coreW,
    h: boxH + 0.65,
    rectRadius: 0.1,
    fill: { color: C.red },
    line: { type: 'none' },
  });
  slide.addText(
    [
      { text: 'Accommodation Booking Capability', options: { bold: true, fontSize: 13, breakLine: true } },
      { text: 'Search · policy · approval · booking · admin · audit', options: { fontSize: 9.5 } },
    ],
    {
      x: coreX + 0.15,
      y: 2.1,
      w: coreW - 0.3,
      h: boxH + 0.65,
      fontFace: FONT_BODY,
      color: C.white,
      align: 'center',
      valign: 'middle',
      margin: 0,
      lineSpacingMultiple: 1.1,
    }
  );

  const extX = coreX + coreW + 0.55;
  const extW = 2.6;
  const ext = [
    ['Identity & Employee Context', 'Trusted client, role attributes'],
    ['Accommodation Core', 'Content, availability, price, orders'],
    ['Notification Services', 'Request, decision, booking updates'],
  ];
  ext.forEach((e, i) => {
    box(extX, 1.45 + i * 1.3, extW, 1.05, C.bluePale, C.ink, e[0], e[1], 10.5);
  });

  // connectors
  function connect(x1, y1, x2, y2) {
    slide.addShape(pres.ShapeType.line, {
      x: x1,
      y: y1,
      w: x2 - x1,
      h: y2 - y1,
      line: { color: C.border, width: 2 },
      arrowTypeEnd: 'triangle',
    });
  }
  connect(leftX + userBoxW, 1.85 + boxH / 2, midX, 1.85 + boxH / 2);
  connect(leftX + userBoxW, 3.0 + boxH / 2, midX, 3.0 + boxH / 2);
  connect(midX + userBoxW, 1.85 + boxH / 2, coreX, 2.1 + (boxH + 0.65) / 2 - 0.3);
  connect(midX + userBoxW, 3.0 + boxH / 2, coreX, 2.1 + (boxH + 0.65) / 2 + 0.3);
  connect(coreX + coreW, 2.1 + (boxH + 0.65) / 2 - 0.55, extX, 1.45 + 0.525);
  connect(coreX + coreW, 2.1 + (boxH + 0.65) / 2, extX, 1.45 + 1.3 + 0.525);
  connect(coreX + coreW, 2.1 + (boxH + 0.65) / 2 + 0.55, extX, 1.45 + 2.6 + 0.525);

  slide.addText(
    'The accommodation booking capability is the system in scope. Internal containers and implementation choices are deferred to the architecture views.',
    {
      x: MARGIN,
      y: 5.35,
      w: PAGE_W - MARGIN * 2,
      h: 0.6,
      fontFace: FONT_BODY,
      fontSize: 12.5,
      italic: true,
      color: C.muted,
      margin: 0,
    }
  );

  footer(slide, nextPage());
})();

(function scopeSlide() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 1 · Context and understanding', 'Proposed first-release boundary');

  const half = (PAGE_W - MARGIN * 2 - 0.5) / 2;

  slide.addShape(pres.ShapeType.roundRect, {
    x: MARGIN,
    y: 1.75,
    w: half,
    h: 4.6,
    rectRadius: 0.1,
    fill: { color: C.successLight },
    line: { type: 'none' },
  });
  addIconCircle(slide, MARGIN + 0.5, 2.25, 0.55, C.success, 'checkCircle', 0.55);
  slide.addText('IN SCOPE', {
    x: MARGIN + 0.9,
    y: 2.0,
    w: half - 1.1,
    h: 0.5,
    fontFace: FONT_BODY,
    fontSize: 15,
    bold: true,
    color: C.success,
    valign: 'middle',
    margin: 0,
  });
  addBulletBlock(
    slide,
    MARGIN + 0.35,
    2.7,
    half - 0.7,
    3.5,
    '',
    [
      'Destination/site selection and search',
      'List, filter, and map views',
      'Policy result and explanation',
      'Request submission',
      'Operator queue and decision',
      'Operator-triggered booking',
      'Confirmation, administration, notifications, and audit',
    ],
    { headColor: C.success }
  );

  const rx = MARGIN + half + 0.5;
  slide.addShape(pres.ShapeType.roundRect, {
    x: rx,
    y: 1.75,
    w: half,
    h: 4.6,
    rectRadius: 0.1,
    fill: { color: C.redLight },
    line: { type: 'none' },
  });
  addIconCircle(slide, rx + 0.5, 2.25, 0.55, C.red, 'alertTriangle', 0.55);
  slide.addText('NOT ASSUMED', {
    x: rx + 0.9,
    y: 2.0,
    w: half - 1.1,
    h: 0.5,
    fontFace: FONT_BODY,
    fontSize: 15,
    bold: true,
    color: C.red,
    valign: 'middle',
    margin: 0,
  });
  addBulletBlock(
    slide,
    rx + 0.35,
    2.7,
    half - 0.7,
    3.5,
    '',
    [
      'Employee self-booking',
      'Flights or ground transport',
      'Expenses',
      'Group or multi-city travel',
      'Multiple suppliers',
      'Complex modification',
      'Automated finance reconciliation',
    ],
    { headColor: C.red }
  );

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// SECTION 2 — Discovery Questions
// ---------------------------------------------------------------------------
sectionDivider('02', 'Discovery Questions', '12 minutes', 'helpCircle');

function questionsSlide(kicker, title, iconName, items, accent) {
  const slide = newSlide(C.white);
  addHeader(slide, kicker, title);
  addIconCircle(slide, PAGE_W - MARGIN - 0.5, 1.0, 0.75, accent, iconName, 0.5);

  const paras = items.map((t, i) => ({
    text: t,
    options: {
      bullet: { code: '25AA', indent: 16 },
      color: C.ink,
      fontSize: 14.5,
      breakLine: i < items.length - 1,
      paraSpaceAfter: 14,
    },
  }));
  slide.addText(paras, {
    x: MARGIN,
    y: 1.75,
    w: PAGE_W - MARGIN * 2,
    h: 5.0,
    fontFace: FONT_BODY,
    margin: 0,
    valign: 'top',
    lineSpacingMultiple: 1.15,
  });
  footer(slide, nextPage());
  return slide;
}

questionsSlide(
  'Section 2 · Discovery questions',
  'Business and product',
  'target',
  [
    'What business outcome and measurable success justify the feature?',
    'Who supports the accommodation queries — Sodexo, Booking.com, or the accommodation provider?',
    'Is the requester always the traveller, or can someone act on their behalf?',
    'May employees submit out-of-policy options, and who approves exceptions?',
    'Who owns the employee experience, operator service level, and post-booking support?',
    'Which countries, sites, languages, and currencies are required first?',
    'How is price calculated — taxes, fees, currency conversion, discounts?',
    'Is white-labelling Booking.com’s services acceptable?',
  ],
  C.blue
);

questionsSlide(
  'Section 2 · Discovery questions',
  'Policy',
  'clipboard',
  [
    'Does the price cap include taxes and mandatory fees?',
    'Is the cap per room, per traveller, average night, highest night, or total stay?',
    'How are foreign currencies converted, and which FX source is approved?',
    'Are distance, category, breakfast, cancellation, weekend, and max-stay rules mandatory?',
    'What price change after approval requires renewed consent?',
    'How are policies versioned, dated, overridden, and audited?',
  ],
  C.warning
);

questionsSlide(
  'Section 2 · Discovery questions',
  'Booking, payment, and operations',
  'dollarSign',
  [
    'Who is the Booking.com affiliate partner and account owner?',
    'Is search-look-book enabled contractually for this application?',
    'Who is merchant of record, and who pays — Sodexo, Tetrapak, operator, employee, or hotel?',
    'Who owns invoices, refunds, chargebacks, reconciliation, no-shows, and disputes?',
    'What should an operator do when a booking call times out?',
    'May employees cancel, or must all servicing go through an operator?',
  ],
  C.success
);

questionsSlide(
  'Section 2 · Discovery questions',
  'Platform, data, and security',
  'shield',
  [
    'Which trusted claims does the existing B2C authentication provide?',
    'Which system owns employee role, cost centre, client, and manager?',
    'Which operator/admin host applications and platform services can be reused?',
    'What travel and traveller data may be stored, for how long, and in which region?',
    'What volumes, peak searches, booking conversion, and service levels apply?',
    'Which notification, map, audit, observability, and secret services are standard?',
  ],
  C.blueDark
);

(function decisionsTable() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 2 · Discovery questions', 'Decisions that block readiness');

  const rows = [
    ['Booking.com commercial / API eligibility', 'Open'],
    ['Payment and merchant-of-record model', 'Open'],
    ['Exact policy calculation', 'Open'],
    ['Authoritative employee-role source', 'Open'],
    ['Operating and support ownership', 'Open'],
  ];

  const top = 1.9;
  const rowH = 0.85;
  const tableX = MARGIN;
  const tableW = PAGE_W - MARGIN * 2;

  slide.addShape(pres.ShapeType.roundRect, {
    x: tableX,
    y: top,
    w: tableW,
    h: 0.6,
    rectRadius: 0.06,
    fill: { color: C.blueDark },
    line: { type: 'none' },
  });
  slide.addText('Decision', {
    x: tableX + 0.3,
    y: top,
    w: tableW * 0.7,
    h: 0.6,
    fontFace: FONT_BODY,
    fontSize: 13,
    bold: true,
    color: C.white,
    valign: 'middle',
    margin: 0,
  });
  slide.addText('Status', {
    x: tableX + tableW * 0.7,
    y: top,
    w: tableW * 0.3 - 0.3,
    h: 0.6,
    fontFace: FONT_BODY,
    fontSize: 13,
    bold: true,
    color: C.white,
    valign: 'middle',
    align: 'center',
    margin: 0,
  });

  rows.forEach((r, i) => {
    const y = top + 0.6 + i * rowH;
    slide.addShape(pres.ShapeType.rect, {
      x: tableX,
      y,
      w: tableW,
      h: rowH,
      fill: { color: i % 2 === 0 ? C.bluePale : C.white },
      line: { color: C.border, width: 0.75 },
    });
    slide.addText(r[0], {
      x: tableX + 0.3,
      y,
      w: tableW * 0.7 - 0.3,
      h: rowH,
      fontFace: FONT_BODY,
      fontSize: 14,
      color: C.ink,
      valign: 'middle',
      margin: 0,
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: tableX + tableW * 0.7 + (tableW * 0.3 - 1.3) / 2 - 0.15,
      y: y + rowH / 2 - 0.22,
      w: 1.3,
      h: 0.44,
      rectRadius: 0.22,
      fill: { color: C.warningLight },
      line: { type: 'none' },
    });
    slide.addText(r[1], {
      x: tableX + tableW * 0.7 + (tableW * 0.3 - 1.3) / 2 - 0.15,
      y: y + rowH / 2 - 0.22,
      w: 1.3,
      h: 0.44,
      fontFace: FONT_BODY,
      fontSize: 12,
      bold: true,
      color: C.warning,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// SECTION 3 — Initial Data Model
// ---------------------------------------------------------------------------
sectionDivider('03', 'Initial Data Model', '10 minutes', 'database');

(function conceptualDataModel() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 3 · Initial data model', 'Conceptual B2C-side model');

  slide.addText(
    'A discovery-stage model for the platform — it does not prescribe a database technology or duplicate authoritative employee data.',
    {
      x: MARGIN,
      y: 1.55,
      w: PAGE_W - MARGIN * 2,
      h: 0.45,
      fontFace: FONT_BODY,
      fontSize: 13,
      color: C.muted,
      margin: 0,
    }
  );

  const groups = [
    {
      title: 'Configuration & identity',
      color: C.blue,
      icon: 'settings',
      items: ['Client', 'Employee Travel Profile', 'Role Level', 'Destination Site', 'Travel Policy'],
    },
    {
      title: 'Request & booking',
      color: C.blueDark,
      icon: 'gitBranch',
      items: ['Booking Request', 'Approval', 'Supplier Booking', 'Audit Event', 'Outbox Event'],
    },
  ];

  const gw = (PAGE_W - MARGIN * 2 - 0.5) / 2;
  groups.forEach((g, gi) => {
    const x = MARGIN + gi * (gw + 0.5);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.15,
      w: gw,
      h: 4.55,
      rectRadius: 0.1,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    addIconCircle(slide, x + 0.55, 2.65, 0.55, g.color, g.icon, 0.5);
    slide.addText(g.title, {
      x: x + 0.95,
      y: 2.38,
      w: gw - 1.2,
      h: 0.5,
      fontFace: FONT_BODY,
      fontSize: 15,
      bold: true,
      color: C.ink,
      valign: 'middle',
      margin: 0,
    });
    g.items.forEach((it, i) => {
      const y = 3.15 + i * 0.65;
      slide.addShape(pres.ShapeType.roundRect, {
        x: x + 0.4,
        y,
        w: gw - 0.8,
        h: 0.48,
        rectRadius: 0.24,
        fill: { color: C.white },
        line: { color: g.color, width: 1 },
      });
      slide.addText(it, {
        x: x + 0.4,
        y,
        w: gw - 0.8,
        h: 0.48,
        fontFace: FONT_BODY,
        fontSize: 13,
        color: C.ink,
        align: 'center',
        valign: 'middle',
        margin: 0,
      });
    });
  });

  footer(slide, nextPage());
})();

(function domainModelCatalogue() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 3 · Initial data model', 'Domain model catalogue');

  slide.addText('25 domain models across six bounded contexts — see the Domain Models page for full detail.', {
    x: MARGIN,
    y: 1.55,
    w: PAGE_W - MARGIN * 2,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 13,
    color: C.muted,
    margin: 0,
  });

  const groups = [
    { title: 'Client & Organisation', color: C.blue, items: ['CorporateClient', 'CorporateLocations', 'CorporateUserRoles', 'CorporateApprovalPolicy', 'CorporatePriceRange', 'ApproverAssignment'] },
    { title: 'Traveller, Request & Approval', color: C.blueDark, items: ['TravellerDetails', 'AccommodationRequest', 'OfferSnapshot', 'PolicySnapshot', 'ClarificationThread', 'ApprovalDecision'] },
    { title: 'Booking & Supplier', color: C.success, items: ['SupplierBooking', 'BookingChangeRequest', 'IdempotencyRecord', 'SupplierCorporation', 'SupplierIntegrationConfig'] },
    { title: 'Financial', color: C.warning, items: ['Invoice', 'BillValidation', 'PaymentInstruction', 'ReconciliationException'] },
    { title: 'Platform & Administration', color: C.blueDark, items: ['PlatformAccessGrant', 'SupportCase'] },
    { title: 'Cross-Cutting Evidence', color: C.muted, items: ['AuditEvent', 'OutboxEvent'] },
  ];

  const colW = (PAGE_W - MARGIN * 2 - 0.35 * 2) / 3;
  const rowH = 2.15;
  groups.forEach((g, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MARGIN + col * (colW + 0.35);
    const y = 1.95 + row * (rowH + 0.2);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: colW,
      h: rowH,
      rectRadius: 0.08,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.18,
      y: y + 0.16,
      w: 0.22,
      h: 0.22,
      rectRadius: 0.05,
      fill: { color: g.color },
      line: { type: 'none' },
    });
    slide.addText(g.title, {
      x: x + 0.5,
      y: y + 0.1,
      w: colW - 0.65,
      h: 0.35,
      fontFace: FONT_BODY,
      fontSize: 11.5,
      bold: true,
      color: C.ink,
      margin: 0,
      valign: 'middle',
    });
    slide.addText(g.items.join('   ·   '), {
      x: x + 0.18,
      y: y + 0.55,
      w: colW - 0.36,
      h: rowH - 0.7,
      fontFace: FONT_BODY,
      fontSize: 9.5,
      color: C.muted,
      margin: 0,
      valign: 'top',
      lineSpacingMultiple: 1.35,
    });
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// SECTION 4 — High-Level API Flow
// ---------------------------------------------------------------------------
sectionDivider('04', 'High-Level API Flow', '10 minutes', 'refreshCw');

(function flowOverview() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 4 · High-level API flow', 'Search, request, and book');

  slide.addText('The browser never calls Booking.com directly — every supplier call is server-side, through a controlled adapter.', {
    x: MARGIN,
    y: 1.55,
    w: PAGE_W - MARGIN * 2,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 13,
    color: C.muted,
    margin: 0,
  });

  const flows = [
    {
      icon: 'search',
      title: 'A · Load and search',
      color: C.blue,
      items: ['Resolve client and role context', 'Search Booking.com through the adapter', 'Evaluate policy for each proposal', 'Return proposals with price and explanation'],
    },
    {
      icon: 'userCheck',
      title: 'B · Request and decision',
      color: C.blueDark,
      items: ['Recheck offer and policy; snapshot both', 'Notify the operator via the outbox', 'Operator approves, rejects, or clarifies', 'Persist the decision and audit event'],
    },
    {
      icon: 'checkCircle',
      title: 'C · Create the reservation',
      color: C.success,
      items: ['Recheck availability and final price', 'Return for renewed approval if changed', 'Create the order with a preview token', 'Persist the confirmation and notify'],
    },
  ];

  const cw = (PAGE_W - MARGIN * 2 - 0.4 * 2) / 3;
  flows.forEach((f, i) => {
    const x = MARGIN + i * (cw + 0.4);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.15,
      w: cw,
      h: 4.3,
      rectRadius: 0.1,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    addIconCircle(slide, x + cw / 2, 2.75, 0.75, f.color, f.icon, 0.5);
    slide.addText(f.title, {
      x: x + 0.2,
      y: 3.25,
      w: cw - 0.4,
      h: 0.4,
      fontFace: FONT_BODY,
      fontSize: 14,
      bold: true,
      color: C.ink,
      align: 'center',
      margin: 0,
    });
    const paras = f.items.map((t, j) => ({
      text: t,
      options: {
        bullet: { code: '25AA', indent: 12 },
        color: C.ink,
        fontSize: 11,
        breakLine: j < f.items.length - 1,
        paraSpaceAfter: 9,
      },
    }));
    slide.addText(paras, {
      x: x + 0.3,
      y: 3.75,
      w: cw - 0.6,
      h: 2.6,
      fontFace: FONT_BODY,
      margin: 0,
      valign: 'top',
      lineSpacingMultiple: 1.1,
    });
    if (i < flows.length - 1) {
      slide.addShape(pres.ShapeType.rightArrow, {
        x: x + cw + 0.03,
        y: 4.15,
        w: 0.34,
        h: 0.3,
        fill: { color: C.border },
        line: { type: 'none' },
      });
    }
  });

  footer(slide, nextPage());
})();

(function integrationPrinciples() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 4 · High-level API flow', 'Booking.com integration principles');

  const items = [
    ['lock', 'Server-side only', 'Bearer token and affiliate ID live in secret management — never in the browser.'],
    ['refreshCw', 'Revalidate volatile data', 'Availability, price, and cancellation terms are rechecked before booking.'],
    ['zap', 'Idempotent booking', 'A retried or timed-out command can never create a duplicate reservation.'],
    ['layers', 'Anti-corruption layer', 'Booking.com schemas and versions stay isolated from the domain model.'],
  ];
  const cw = (PAGE_W - MARGIN * 2 - 0.4 * 3) / 4;
  items.forEach((it, i) => {
    const x = MARGIN + i * (cw + 0.4);
    addCard(slide, x, 2.0, cw, 3.9, it[0], it[1], it[2], i % 2 === 0 ? C.blue : C.blueDark);
  });

  slide.addShape(pres.ShapeType.roundRect, {
    x: MARGIN,
    y: 6.1,
    w: PAGE_W - MARGIN * 2,
    h: 0.5,
    rectRadius: 0.08,
    fill: { color: C.warningLight },
    line: { type: 'none' },
  });
  slide.addText('Booking.com’s preview order token is time-limited — preview and create belong in the controlled booking step, not at initial selection.', {
    x: MARGIN + 0.25,
    y: 6.1,
    w: PAGE_W - MARGIN * 2 - 0.5,
    h: 0.5,
    fontFace: FONT_BODY,
    fontSize: 11.5,
    italic: true,
    color: C.warning,
    valign: 'middle',
    margin: 0,
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// SECTION 5 — Architecture Principles
// ---------------------------------------------------------------------------
sectionDivider('05', 'Architecture Principles', '8 minutes', 'layers');

(function principlesSlide() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 5 · Architecture principles', 'Ten principles, independent of technology');

  const principles = [
    ['Server-side supplier integration', 'Protects credentials, prevents rule bypass'],
    ['Trusted identity and tenant context', 'Entitlement cannot depend on browser data'],
    ['Policy as versioned domain logic', 'Explainable, auditable, time-bound caps'],
    ['Request before reservation', 'Separates intent, approval, attempt, confirmation'],
    ['Supplier anti-corruption layer', 'Isolates domain from Booking.com’s schemas'],
    ['Revalidate volatile data', 'Price, availability, and terms may change'],
    ['Idempotent, recoverable booking', 'Retries never silently duplicate reservations'],
    ['Audit by design', 'Every decision and change needs evidence'],
    ['Privacy and least privilege', 'Minimise and control sensitive data access'],
    ['Observable operations', 'Correlation, ageing, failure, reconciliation visibility'],
  ];

  const colW = (PAGE_W - MARGIN * 2 - 0.4) / 2;
  const rowH = 0.98;
  principles.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * (colW + 0.4);
    const y = 1.75 + row * rowH;
    addIconCircle(slide, x + 0.28, y + 0.32, 0.42, col === 0 ? C.blue : C.blueDark, 'checkCircle', 0.5);
    slide.addText(
      [
        { text: p[0], options: { bold: true, fontSize: 12.5, color: C.ink, breakLine: true } },
        { text: p[1], options: { fontSize: 10, color: C.muted } },
      ],
      {
        x: x + 0.6,
        y: y - 0.02,
        w: colW - 0.6,
        h: rowH - 0.06,
        fontFace: FONT_BODY,
        valign: 'middle',
        margin: 0,
        lineSpacingMultiple: 1.1,
      }
    );
  });

  footer(slide, nextPage());
})();

(function nfrSlide() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 5 · Architecture principles', 'Non-functional requirements & targets');

  const stats = [
    ['99.9%', 'Employee & operator uptime'],
    ['99.5%', 'Admin capability uptime'],
    ['<200ms', 'Policy evaluation, p95'],
    ['<2s', 'Request submission, p95'],
  ];
  const sw = (PAGE_W - MARGIN * 2 - 0.3 * 3) / 4;
  stats.forEach((s, i) => {
    const x = MARGIN + i * (sw + 0.3);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 1.7,
      w: sw,
      h: 1.15,
      rectRadius: 0.08,
      fill: { color: i === 0 || i === 2 ? C.blue : C.blueDark },
      line: { type: 'none' },
    });
    slide.addText(s[0], {
      x,
      y: 1.78,
      w: sw,
      h: 0.55,
      fontFace: FONT_HEAD,
      fontSize: 26,
      bold: true,
      color: C.white,
      align: 'center',
      margin: 0,
    });
    slide.addText(s[1], {
      x: x + 0.1,
      y: 2.35,
      w: sw - 0.2,
      h: 0.4,
      fontFace: FONT_BODY,
      fontSize: 10,
      color: C.blueLight,
      align: 'center',
      margin: 0,
    });
  });

  const nfrs = [
    ['shield', 'Security & Privacy'],
    ['refreshCw', 'Resilience'],
    ['barChart', 'Scalability'],
    ['eye', 'Observability'],
    ['checkCircle', 'Auditability'],
    ['layers', 'Maintainability'],
    ['link', 'Interoperability'],
    ['dollarSign', 'Cost Efficiency'],
    ['clock', 'Availability'],
    ['zap', 'Performance'],
    ['home', 'Accessibility'],
    ['alertTriangle', 'Disaster Recovery'],
  ];
  const cols = 6;
  const cw = (PAGE_W - MARGIN * 2 - 0.25 * (cols - 1)) / cols;
  nfrs.forEach((n, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = MARGIN + col * (cw + 0.25);
    const y = 3.25 + row * 1.55;
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: cw,
      h: 1.35,
      rectRadius: 0.08,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    addIconCircle(slide, x + cw / 2, y + 0.42, 0.5, row === 0 ? C.blue : C.blueDark, n[0], 0.5);
    slide.addText(n[1], {
      x: x + 0.06,
      y: y + 0.78,
      w: cw - 0.12,
      h: 0.5,
      fontFace: FONT_BODY,
      fontSize: 10,
      bold: true,
      color: C.ink,
      align: 'center',
      margin: 0,
      lineSpacingMultiple: 1.0,
    });
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// SECTION 6 — Next Steps and Workshops
// ---------------------------------------------------------------------------
sectionDivider('06', 'Next Steps and Workshops', '5 minutes', 'trendingUp');

(function workshopsSlide() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 6 · Next steps and workshops', 'Recommended discovery work');

  const rows = [
    ['Business outcomes and scope', 'Sponsor, product, operations'],
    ['Employee and operator journey', 'Product, UX, operators, support'],
    ['Policy and entitlement', 'Product, policy owners, finance'],
    ['Payment and operating model', 'Finance, procurement, legal'],
    ['Booking.com capability validation', 'Procurement, architects, engineers'],
    ['Identity, data, security & privacy', 'Platform, IAM, security, privacy'],
    ['Technical spike', 'B2C and integration engineers'],
    ['NFR & operational readiness', 'Product, SRE, support, security'],
    ['MVP planning and estimation', 'Product, architecture, delivery'],
  ];

  const colCount = 3;
  const cw = (PAGE_W - MARGIN * 2 - 0.3 * (colCount - 1)) / colCount;
  const rh = 1.55;
  rows.forEach((r, i) => {
    const col = i % colCount;
    const row = Math.floor(i / colCount);
    const x = MARGIN + col * (cw + 0.3);
    const y = 1.75 + row * (rh + 0.2);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: cw,
      h: rh,
      rectRadius: 0.08,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.18,
      y: y + 0.16,
      w: 0.36,
      h: 0.36,
      rectRadius: 0.18,
      fill: { color: (row + col) % 2 === 0 ? C.blue : C.blueDark },
      line: { type: 'none' },
    });
    slide.addText(String(i + 1), {
      x: x + 0.18,
      y: y + 0.16,
      w: 0.36,
      h: 0.36,
      fontFace: FONT_BODY,
      fontSize: 12,
      bold: true,
      color: C.white,
      align: 'center',
      valign: 'middle',
      margin: 0,
    });
    slide.addText(r[0], {
      x: x + 0.18,
      y: y + 0.6,
      w: cw - 0.36,
      h: 0.5,
      fontFace: FONT_BODY,
      fontSize: 12,
      bold: true,
      color: C.ink,
      margin: 0,
      lineSpacingMultiple: 1.05,
    });
    slide.addText(r[1], {
      x: x + 0.18,
      y: y + 1.08,
      w: cw - 0.36,
      h: 0.4,
      fontFace: FONT_BODY,
      fontSize: 9.5,
      color: C.muted,
      margin: 0,
    });
  });

  footer(slide, nextPage());
})();

(function readinessGates() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 6 · Next steps and workshops', 'Phase 0 readiness gates');

  slide.addText('Ready for delivery planning only when:', {
    x: MARGIN,
    y: 1.55,
    w: PAGE_W - MARGIN * 2,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 13,
    color: C.muted,
    margin: 0,
  });

  const gates = [
    'Booking.com affiliate eligibility and required API capabilities are confirmed',
    'The payment and merchant-of-record model is approved',
    'Employee role and client context have an authoritative source',
    'Policy calculations and exception ownership are unambiguous',
    'The operator/support model and reconciliation ownership are accepted',
    'Privacy, security, data-retention, and commercial constraints are recorded',
    'A sandbox spike proves the critical search and booking path',
  ];

  gates.forEach((g, i) => {
    const y = 2.1 + i * 0.66;
    addIconCircle(slide, MARGIN + 0.25, y + 0.24, 0.42, C.warning, 'alertTriangle', 0.5);
    slide.addText(g, {
      x: MARGIN + 0.6,
      y,
      w: PAGE_W - MARGIN * 2 - 0.6,
      h: 0.5,
      fontFace: FONT_BODY,
      fontSize: 13,
      color: C.ink,
      valign: 'middle',
      margin: 0,
    });
  });

  footer(slide, nextPage());
})();

(function deliveryPath() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 6 · Next steps and workshops', 'Suggested delivery path');

  const phases = [
    ['search', 'Search and request', 'Validate demand, policy, operator queue, and manual completion'],
    ['checkCircle', 'Integrated operator booking', 'Add preview/create, confirmation, recovery, and reconciliation'],
    ['trendingUp', 'Post-booking and optimisation', 'Add supported servicing, reporting, automation, future suppliers'],
  ];
  const cw = (PAGE_W - MARGIN * 2 - 0.5 * 2) / 3;
  phases.forEach((p, i) => {
    const x = MARGIN + i * (cw + 0.5);
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.1,
      w: cw,
      h: 3.7,
      rectRadius: 0.1,
      fill: { color: C.bluePale },
      line: { type: 'none' },
    });
    slide.addText(`Phase ${i + 1}`, {
      x: x + 0.25,
      y: 2.3,
      w: cw - 0.5,
      h: 0.35,
      fontFace: FONT_BODY,
      fontSize: 11,
      bold: true,
      color: C.blueDark,
      charSpacing: 1.5,
      margin: 0,
    });
    addIconCircle(slide, x + cw / 2, 3.15, 0.7, C.blue, p[0], 0.5);
    slide.addText(p[1], {
      x: x + 0.25,
      y: 3.65,
      w: cw - 0.5,
      h: 0.55,
      fontFace: FONT_BODY,
      fontSize: 14,
      bold: true,
      color: C.ink,
      align: 'center',
      margin: 0,
    });
    slide.addText(p[2], {
      x: x + 0.35,
      y: 4.25,
      w: cw - 0.7,
      h: 1.4,
      fontFace: FONT_BODY,
      fontSize: 11,
      color: C.muted,
      align: 'center',
      margin: 0,
      lineSpacingMultiple: 1.15,
    });
    if (i < phases.length - 1) {
      slide.addShape(pres.ShapeType.rightArrow, {
        x: x + cw + 0.08,
        y: 3.75,
        w: 0.34,
        h: 0.3,
        fill: { color: C.border },
        line: { type: 'none' },
      });
    }
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
// SECTION 7 — Q&A and Decision Recap
// ---------------------------------------------------------------------------
sectionDivider('07', 'Q&A and Decision Recap', '10 minutes', 'messageSquare');

(function immediateActions() {
  const slide = newSlide(C.white);
  addHeader(slide, 'Section 7 · Q&A and decision recap', 'Immediate actions');

  const rows = [
    'Nominate business, product, and technical decision owners',
    'Start Booking.com commercial/API validation',
    'Schedule policy and payment workshops',
    'Confirm employee-role and destination data sources',
    'Prepare sandbox technical spike',
    'Baseline MVP after readiness-gate playback',
  ];

  rows.forEach((r, i) => {
    const y = 1.85 + i * 0.78;
    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN,
      y,
      w: PAGE_W - MARGIN * 2,
      h: 0.62,
      rectRadius: 0.06,
      fill: { color: i % 2 === 0 ? C.bluePale : C.white },
      line: { color: C.border, width: 0.75 },
    });
    addIconCircle(slide, MARGIN + 0.42, y + 0.31, 0.4, C.blue, 'arrowRight', 0.45);
    slide.addText(r, {
      x: MARGIN + 0.75,
      y,
      w: PAGE_W - MARGIN * 2 - 2.3,
      h: 0.62,
      fontFace: FONT_BODY,
      fontSize: 13,
      color: C.ink,
      valign: 'middle',
      margin: 0,
    });
    slide.addText('Owner: TBD', {
      x: PAGE_W - MARGIN - 1.6,
      y,
      w: 1.5,
      h: 0.62,
      fontFace: FONT_BODY,
      fontSize: 10.5,
      italic: true,
      color: C.muted,
      valign: 'middle',
      align: 'right',
      margin: 0,
    });
  });

  footer(slide, nextPage());
})();

(function closing() {
  const slide = newSlide(C.blue);
  slide.addShape(pres.ShapeType.ellipse, {
    x: -2.5,
    y: -2.5,
    w: 6,
    h: 6,
    fill: { color: C.blueDark },
    line: { type: 'none' },
  });
  slide.addShape(pres.ShapeType.ellipse, {
    x: PAGE_W - 3.5,
    y: PAGE_H - 3.5,
    w: 5.5,
    h: 5.5,
    fill: { color: C.blueDark },
    line: { type: 'none' },
  });

  addIconCircle(slide, PAGE_W / 2, 2.5, 1.3, C.blueDark, 'messageSquare', 0.5);
  slide.addText('Thank you', {
    x: 0,
    y: 3.3,
    w: PAGE_W,
    h: 0.9,
    fontFace: FONT_HEAD,
    fontSize: 40,
    bold: true,
    color: C.white,
    align: 'center',
    margin: 0,
  });
  slide.addText('Questions & discussion', {
    x: 0,
    y: 4.15,
    w: PAGE_W,
    h: 0.5,
    fontFace: FONT_BODY,
    fontSize: 18,
    color: C.blueLight,
    align: 'center',
    margin: 0,
  });
  slide.addText('Before we close: agreed decisions, unresolved blockers, owners, and dates.', {
    x: 0,
    y: 5.2,
    w: PAGE_W,
    h: 0.4,
    fontFace: FONT_BODY,
    fontSize: 13,
    italic: true,
    color: C.blueLight,
    align: 'center',
    margin: 0,
  });

  footer(slide, nextPage());
})();

// ---------------------------------------------------------------------------
pres.writeFile({ fileName: OUT_PATH }).then(() => {
  console.log(`Wrote ${OUT_PATH}`);
});
