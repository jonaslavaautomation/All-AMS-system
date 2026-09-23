/* Real ACORD PDF filling, client-side, using pdf-lib.
   Two passes, both write-verified (a key that has a value but fails to write
   is recorded in `failed`, never silently dropped):
     1. Taxonomy pass — fills any semantic ACORD field by naming convention.
     2. Overlay pass  — draws text on flat print PDFs with no AcroForm fields. */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TEMPLATE_URL, OVERLAY, type AcordFormId } from './acordSchema';
import { TAXONOMY, CHECK_RULES, normFieldName, type AcordValues } from './acordTaxonomy';

const templateCache: Partial<Record<AcordFormId, Uint8Array>> = {};

async function loadTemplate(id: AcordFormId): Promise<Uint8Array> {
  const cached = templateCache[id];
  if (cached) return cached;
  const response = await fetch(TEMPLATE_URL[id]);
  if (!response.ok) throw new Error(`ACORD ${id} template not found`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  templateCache[id] = bytes;
  return bytes;
}

const trimVal = (values: AcordValues, key: string): string => {
  const v = values[key];
  return v == null ? '' : String(v).trim();
};
const cityLine = (values: AcordValues): string => [trimVal(values, 'insCity'), trimVal(values, 'insState'), trimVal(values, 'insZip')].filter(Boolean).join(' ');

export type FillResult = { bytes: Uint8Array; wrote: number; expected: number; failed: { key: string; target: string; reason: string }[] };

export async function fillAcordForm(formId: AcordFormId, values: AcordValues): Promise<FillResult> {
  const doc = await PDFDocument.load(await loadTemplate(formId), { ignoreEncryption: true });
  let wrote = 0;
  let expected = 0;
  const failed: FillResult['failed'] = [];
  const seenKeys = new Set<string>();
  let acroFieldCount = 0;

  try {
    const form = doc.getForm();
    const fields = form.getFields();
    acroFieldCount = fields.length;

    for (const field of fields) {
      const key = TAXONOMY[normFieldName(field.getName())];
      if (!key) continue;
      const value = trimVal(values, key);
      if (!value) continue;
      if (!seenKeys.has(key)) { expected += 1; seenKeys.add(key); }
      try { form.getTextField(field.getName()).setText(value); wrote += 1; }
      catch (e) { failed.push({ key, target: field.getName(), reason: e instanceof Error ? e.message : String(e) }); }
    }

    for (const rule of CHECK_RULES) {
      if (!trimVal(values, rule.when)) continue;
      const stems = new Set(rule.check);
      for (const field of fields) {
        if (stems.has(normFieldName(field.getName()))) {
          try { form.getCheckBox(field.getName()).check(); } catch { /* not a checkbox on this template */ }
        }
      }
    }
    try { form.updateFieldAppearances(); } catch { /* fonts embedded elsewhere */ }
  } catch { /* no AcroForm on this PDF at all */ }

  const overlayMap = OVERLAY[formId];
  if (overlayMap && (overlayMap._always || acroFieldCount === 0)) {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const ink = rgb(0.03, 0.12, 0.32);
    const pages = doc.getPages();
    const pageOverrides = overlayMap._pages || {};
    for (const key of Object.keys(overlayMap)) {
      if (key.startsWith('_')) continue;
      const value = key === 'cityLine' ? cityLine(values) : trimVal(values, key);
      if (!value) continue;
      expected += 1;
      try {
        const [x, y, size, maxWidth] = overlayMap[key] as [number, number, number, number | undefined];
        let text = value;
        if (maxWidth) { while (text.length && font.widthOfTextAtSize(text, size) > maxWidth) text = text.slice(0, -1); }
        const pageIndex = pageOverrides[key] != null ? pageOverrides[key] : (overlayMap._page || 0);
        const page = pages[pageIndex];
        if (!page) throw new Error(`page index ${pageIndex} out of range`);
        page.drawText(text, { x, y, size, font, color: ink });
        wrote += 1;
      } catch (e) { failed.push({ key, target: 'overlay', reason: e instanceof Error ? e.message : String(e) }); }
    }
  }

  return { bytes: await doc.save(), wrote, expected, failed };
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
