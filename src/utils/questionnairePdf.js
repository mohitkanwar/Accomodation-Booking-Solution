import {jsPDF} from 'jspdf';

const DOCUMENT_TITLE = 'Discovery Workshop Questionnaire';
const DOCUMENT_VERSION = '1.0';
const DOCUMENT_STATUS = 'Working document';
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CONTENT_TOP = 30;
const CONTENT_BOTTOM = 275;

const COLORS = {
  blue: [43, 55, 151],
  blueDark: [32, 42, 120],
  bluePale: [245, 246, 252],
  border: [201, 206, 232],
  ink: [26, 32, 64],
  muted: [95, 102, 133],
  red: [237, 28, 36],
  white: [255, 255, 255],
};

function cleanText(value) {
  return String(value ?? '')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00d7/g, 'x')
    .replace(/\u20ac/g, 'EUR ')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function formatDownloadDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatWorkshopDate(value) {
  if (!value) return 'Not specified';

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return cleanText(value);

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load the Sodexo logo (${response.status}).`);
  }

  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the Sodexo logo.'));
    reader.readAsDataURL(blob);
  });
}

function detailAnswerId(question, option) {
  const optionSlug = option.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${question.id}Detail-${optionSlug}`;
}

function getAnswerLines(question, answers) {
  const value = answers[question.id];

  if (question.type === 'system-ownership') return [];

  if (Array.isArray(value)) {
    const selected = value
      .filter((item) => typeof item === 'string' && item.trim())
      .map((item) => {
        const details = question.captureOptionDetails
          ? cleanText(answers[detailAnswerId(question, item)])
          : '';
        return details ? `- ${item}: ${details}` : `- ${item}`;
      });

    if (value.includes('Other') && answers[`${question.id}Other`]) {
      selected.push(`  Other detail: ${answers[`${question.id}Other`]}`);
    }

    return selected.length > 0 ? selected.map(cleanText) : ['Not captured'];
  }

  const text = cleanText(value);
  if (!text) return ['Not captured'];

  const otherDetail = cleanText(answers[`${question.id}Other`]);
  return otherDetail ? [text, `Other detail: ${otherDetail}`] : [text];
}

function addLogo(doc, logoDataUrl, x, y, width) {
  doc.addImage(logoDataUrl, 'PNG', x, y, width, width / 2.9767, undefined, 'FAST');
}

function drawCover(doc, logoDataUrl, formState, generatedAt) {
  doc.setFillColor(...COLORS.bluePale);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 0, PAGE_WIDTH, 47, 'F');
  doc.setFillColor(...COLORS.red);
  doc.rect(0, 47, PAGE_WIDTH, 2, 'F');
  addLogo(doc, logoDataUrl, MARGIN_X, 13, 46);

  doc.setTextColor(...COLORS.blueDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(DOCUMENT_TITLE, MARGIN_X, 69);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.muted);
  doc.text('Accommodation Booking Solution', MARGIN_X, 78);

  const workshop = formState.workshop || {};
  const details = [
    ['Workshop', cleanText(workshop.name) || 'Discovery workshop'],
    ['Client', cleanText(workshop.client) || 'Not specified'],
    ['Workshop date', formatWorkshopDate(workshop.date)],
    ['Facilitator', cleanText(workshop.facilitator) || 'Not specified'],
  ];

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(MARGIN_X, 91, CONTENT_WIDTH, 50, 3, 3, 'FD');
  doc.setFontSize(9);
  details.forEach(([label, value], index) => {
    const rowY = 101 + index * 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.muted);
    doc.text(label.toUpperCase(), MARGIN_X + 6, rowY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.ink);
    doc.text(cleanText(value), MARGIN_X + 48, rowY);
    if (index < details.length - 1) {
      doc.setDrawColor(...COLORS.border);
      doc.line(MARGIN_X + 6, rowY + 4, PAGE_WIDTH - MARGIN_X - 6, rowY + 4);
    }
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.blueDark);
  doc.setFontSize(12);
  doc.text('Document control', MARGIN_X, 158);

  const control = [
    ['Document version', DOCUMENT_VERSION, 'Status', DOCUMENT_STATUS],
    ['Generated on', formatDownloadDate(generatedAt), 'Classification', 'Internal'],
    ['Source', 'Interactive discovery questionnaire', 'Format', 'Controlled PDF copy'],
  ];
  const columnWidths = [35, 59, 30, 54];
  let controlY = 164;
  control.forEach((row, rowIndex) => {
    let x = MARGIN_X;
    row.forEach((cell, cellIndex) => {
      doc.setFillColor(
        ...(cellIndex % 2 === 0 ? COLORS.bluePale : COLORS.white),
      );
      doc.setDrawColor(...COLORS.border);
      doc.rect(x, controlY, columnWidths[cellIndex], 12, 'FD');
      doc.setFont('helvetica', cellIndex % 2 === 0 ? 'bold' : 'normal');
      doc.setTextColor(
        ...(cellIndex % 2 === 0 ? COLORS.blueDark : COLORS.ink),
      );
      doc.setFontSize(7.5);
      const lines = doc.splitTextToSize(cleanText(cell), columnWidths[cellIndex] - 4);
      doc.text(lines.slice(0, 2), x + 2, controlY + 5);
      x += columnWidths[cellIndex];
    });
    controlY += 12;
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.blueDark);
  doc.setFontSize(12);
  doc.text('Version history', MARGIN_X, 215);

  const historyHeaders = ['Version', 'Date', 'Change', 'Owner'];
  const historyWidths = [22, 39, 77, 40];
  let x = MARGIN_X;
  historyHeaders.forEach((heading, index) => {
    doc.setFillColor(...COLORS.blue);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.rect(x, 221, historyWidths[index], 9, 'F');
    doc.text(heading, x + 2, 227);
    x += historyWidths[index];
  });

  const historyRows = [
    [
      DOCUMENT_VERSION,
      '07 August 2026',
      'PDF-enabled discovery questionnaire introduced',
      'Solution Architecture',
    ],
    [
      'Workshop copy',
      formatDownloadDate(generatedAt),
      'Current questionnaire responses exported',
      cleanText(workshop.facilitator) || 'Workshop facilitator',
    ],
  ];
  let historyY = 230;
  historyRows.forEach((row, rowIndex) => {
    x = MARGIN_X;
    row.forEach((cell, index) => {
      doc.setFillColor(...(rowIndex % 2 === 0 ? COLORS.white : COLORS.bluePale));
      doc.setDrawColor(...COLORS.border);
      doc.rect(x, historyY, historyWidths[index], 15, 'FD');
      doc.setTextColor(...COLORS.ink);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      const lines = doc.splitTextToSize(cleanText(cell), historyWidths[index] - 4);
      doc.text(lines.slice(0, 3), x + 2, historyY + 5);
      x += historyWidths[index];
    });
    historyY += 15;
  });
}

function drawContentHeader(doc, logoDataUrl) {
  addLogo(doc, logoDataUrl, MARGIN_X, 7, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.blueDark);
  doc.text(DOCUMENT_TITLE, PAGE_WIDTH - MARGIN_X, 13, {align: 'right'});
  doc.setDrawColor(...COLORS.red);
  doc.setLineWidth(0.7);
  doc.line(MARGIN_X, 22, PAGE_WIDTH - MARGIN_X, 22);
}

function addContentPage(doc, logoDataUrl) {
  doc.addPage();
  drawContentHeader(doc, logoDataUrl);
  return CONTENT_TOP;
}

function drawSectionHeading(doc, section, y) {
  doc.setFillColor(...COLORS.blue);
  doc.roundedRect(MARGIN_X, y, CONTENT_WIDTH, 11, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`${section.number}  ${cleanText(section.title)}`, MARGIN_X + 5, y + 7);
  return y + 16;
}

function drawQuestionHeading(doc, questionNumber, question, y) {
  doc.setFillColor(...COLORS.bluePale);
  doc.roundedRect(MARGIN_X, y, 12, 7, 1.5, 1.5, 'F');
  doc.setTextColor(...COLORS.blueDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(questionNumber, MARGIN_X + 6, y + 4.7, {align: 'center'});

  doc.setFontSize(9.5);
  const questionLines = doc.splitTextToSize(
    cleanText(question.label),
    CONTENT_WIDTH - 18,
  );
  doc.text(questionLines, MARGIN_X + 17, y + 4.7);
  return y + Math.max(8, questionLines.length * 4.2 + 2);
}

function drawHint(doc, hint, y) {
  if (!hint) return y;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  const lines = doc.splitTextToSize(cleanText(hint), CONTENT_WIDTH - 17);
  doc.text(lines, MARGIN_X + 17, y);
  return y + lines.length * 3.5 + 2;
}

function drawAnswerBlock(doc, lines, y, addPage) {
  const normalized = lines.flatMap((line) =>
    doc.splitTextToSize(cleanText(line), CONTENT_WIDTH - 27),
  );
  let index = 0;

  while (index < normalized.length) {
    const availableLines = Math.max(
      1,
      Math.floor((CONTENT_BOTTOM - y - 5) / 4),
    );
    if (availableLines < 2 && index < normalized.length) {
      y = addPage();
      continue;
    }

    const chunk = normalized.slice(index, index + availableLines);
    const blockHeight = chunk.length * 4 + 5;
    doc.setFillColor(...COLORS.bluePale);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(MARGIN_X + 17, y, CONTENT_WIDTH - 17, blockHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(...COLORS.ink);
    doc.text(chunk, MARGIN_X + 21, y + 5);
    y += blockHeight + 4;
    index += chunk.length;
  }

  return y;
}

function drawOwnershipTable(doc, question, answers, y, addPage, questionNumber) {
  const widths = [53, 62, 63];
  const headers = ['Functional area', 'Actual system / source', 'Accountable person / team'];

  function drawTableHeader(currentY) {
    let x = MARGIN_X;
    headers.forEach((header, index) => {
      doc.setFillColor(...COLORS.blue);
      doc.rect(x, currentY, widths[index], 9, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(header, x + 2, currentY + 5.8);
      x += widths[index];
    });
    return currentY + 9;
  }

  y = drawTableHeader(y);
  const ownership =
    answers[question.id] &&
    !Array.isArray(answers[question.id]) &&
    typeof answers[question.id] === 'object'
      ? answers[question.id]
      : {};

  question.functionalAreas.forEach((functionalArea, rowIndex) => {
    const entry = ownership[functionalArea] || {};
    const cells = [
      cleanText(functionalArea),
      cleanText(entry.systemName) || 'Not captured',
      cleanText(entry.owner) || 'Not captured',
    ];
    const wrapped = cells.map((cell, index) =>
      doc.splitTextToSize(cell, widths[index] - 4),
    );
    const rowHeight = Math.max(...wrapped.map((lines) => lines.length)) * 3.8 + 4;

    if (y + rowHeight > CONTENT_BOTTOM) {
      y = addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.blueDark);
      doc.text(`${questionNumber}  ${cleanText(question.label)} (continued)`, MARGIN_X, y);
      y += 6;
      y = drawTableHeader(y);
    }

    let x = MARGIN_X;
    wrapped.forEach((lines, index) => {
      doc.setFillColor(...(rowIndex % 2 === 0 ? COLORS.white : COLORS.bluePale));
      doc.setDrawColor(...COLORS.border);
      doc.rect(x, y, widths[index], rowHeight, 'FD');
      doc.setTextColor(...COLORS.ink);
      doc.setFont('helvetica', index === 0 ? 'bold' : 'normal');
      doc.setFontSize(7.4);
      doc.text(lines, x + 2, y + 5);
      x += widths[index];
    });
    y += rowHeight;
  });

  return y + 5;
}

function drawFooter(doc, pageNumber, totalPages, generatedAt) {
  doc.setPage(pageNumber);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, 282, PAGE_WIDTH - MARGIN_X, 282);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Generated ${formatDownloadDate(generatedAt)}`, MARGIN_X, 288);
  doc.text(
    `Sodexo | ${DOCUMENT_TITLE} | v${DOCUMENT_VERSION}`,
    PAGE_WIDTH / 2,
    288,
    {align: 'center'},
  );
  doc.text(`Page ${pageNumber} of ${totalPages}`, PAGE_WIDTH - MARGIN_X, 288, {
    align: 'right',
  });
}

export function buildQuestionnairePdf({
  formState,
  generatedAt = new Date(),
  logoDataUrl,
  sections,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  doc.setProperties({
    title: DOCUMENT_TITLE,
    subject: 'Accommodation booking discovery workshop questionnaire',
    author: 'Sodexo - Solution Architecture',
    creator: 'Accommodation Booking Solution',
    keywords: 'discovery workshop, accommodation booking, questionnaire',
  });

  drawCover(doc, logoDataUrl, formState, generatedAt);
  let y = addContentPage(doc, logoDataUrl);
  const answers = formState.answers || {};
  const addPage = () => addContentPage(doc, logoDataUrl);

  sections.forEach((section) => {
    if (y + 18 > CONTENT_BOTTOM) y = addPage();
    y = drawSectionHeading(doc, section, y);

    section.questions.forEach((question, questionIndex) => {
      const questionNumber = `${section.number}.${String(questionIndex + 1).padStart(2, '0')}`;
      if (y + 32 > CONTENT_BOTTOM) y = addPage();
      y = drawQuestionHeading(doc, questionNumber, question, y);
      y = drawHint(doc, question.hint, y);

      if (question.type === 'system-ownership') {
        if (y + 18 > CONTENT_BOTTOM) y = addPage();
        y = drawOwnershipTable(doc, question, answers, y, addPage, questionNumber);
      } else {
        y = drawAnswerBlock(doc, getAnswerLines(question, answers), y, addPage);
      }
    });
  });

  const totalPages = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    drawFooter(doc, pageNumber, totalPages, generatedAt);
  }

  return doc;
}

export async function downloadQuestionnairePdf({
  formState,
  logoUrl,
  sections,
}) {
  const generatedAt = new Date();
  const logoDataUrl = await imageUrlToDataUrl(logoUrl);
  const doc = buildQuestionnairePdf({
    formState,
    generatedAt,
    logoDataUrl,
    sections,
  });
  const date = generatedAt.toISOString().slice(0, 10);
  doc.save(`discovery-workshop-questionnaire-${date}.pdf`);
}

export const questionnairePdfMetadata = {
  title: DOCUMENT_TITLE,
  version: DOCUMENT_VERSION,
};
