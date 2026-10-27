import { SafetyCard } from './safety-card.model';
import { FRASI_H } from './frasi-h';

// Colonne del foglio "Dati da estrapolare" del file "dati per SDS.xlsx":
// stesso ordine, stesse intestazioni e stesse descrizioni (riga 2) del file.
// Tabella, scheda di dettaglio e form usano questa definizione.
export type SdsFieldKey =
  | 'clients' | 'titolo' | 'enteEmittitore' | 'frasiH' | 'pittogrammi'
  | 'composizioneCasSopra' | 'composizioneCasSotto' | 'composizione' | 'contieneDiisocianati'
  | 'statoFisico' | 'temperaturaEbollizione' | 'covPercent' | 'densita' | 'sdsUrl' | 'dataRilascio'
  | 'nomeFileImportato';

// kind decide come il valore viene mostrato in tabella e nel dettaglio:
//  cas     -> solo i numeri CAS          names   -> solo i nomi dei componenti
//  ghs     -> solo i codici GHS          teb     -> solo il valore minimo
//  density -> convertita in g/cm³
export interface SdsField {
  key: SdsFieldKey;
  label: string;
  hint?: string;
  kind: 'client' | 'text' | 'cas' | 'names' | 'hcodes' | 'ghs' | 'bool' | 'url' | 'date' | 'teb' | 'density' | 'file';
  // Campo non presente nel file Excel e non modificabile dal form
  readonly?: boolean;
  // Unità del valore convertito: in tabella e nel dettaglio va solo nell'intestazione
  unit?: string;
}

export const SDS_FIELDS: SdsField[] = [
  { key: 'clients', label: 'ID CLIENTE', hint: 'relazione con id tabella clienti: una scheda può essere collegata a più clienti', kind: 'client' },
  { key: 'titolo', label: 'Nome prodotto chimico', hint: 'si trova al punto 1.1 della SDS', kind: 'text' },
  { key: 'enteEmittitore', label: 'Produttore', hint: 'si trova al punto 1.3 della SDS', kind: 'text' },
  { key: 'frasiH', label: 'Frasi H', hint: 'si trovano al punto 2.1 della SDS', kind: 'hcodes' },
  { key: 'pittogrammi', label: 'Pittogramma', hint: 'si trovano al punto 2.2 della SDS. Spesso ci sono i pittogrammi ma serve il codice', kind: 'ghs' },
  { key: 'composizioneCasSopra', label: 'Composizione n. CAS > 0,1%', hint: 'si trova al punto 3 della SDS. >0,1% si riferisce alla quantità di quel componente nel prodotto', kind: 'cas' },
  { key: 'composizioneCasSotto', label: 'Composizione n. CAS < 0,1%', hint: 'si trova al punto 3 della SDS. <0,1% si riferisce alla quantità di quel componente nel prodotto', kind: 'cas' },
  { key: 'composizione', label: 'Composizione', hint: 'si trova al punto 3 della SDS', kind: 'names' },
  { key: 'contieneDiisocianati', label: 'Diisocianati', hint: 'si recuperano dalla composizione: riconoscibili dalla desinenza "diiso" o "di-iso"', kind: 'bool' },
  { key: 'statoFisico', label: 'Stato fisico', hint: 'si trova al punto 9 della SDS', kind: 'text' },
  { key: 'temperaturaEbollizione', label: 'Teb', hint: 'si trova al punto 9 della SDS', kind: 'teb', unit: '°C' },
  { key: 'covPercent', label: '%COV o VOC', hint: 'va riportata in %: se nella SDS è in g/l, COV g/l diviso la densità. Se non si trova va calcolato', kind: 'text' },
  { key: 'densita', label: 'Densità', hint: 'si trova al punto 9 della SDS', kind: 'density', unit: 'g/cm³' },
  { key: 'sdsUrl', label: 'SDS', kind: 'url' },
  { key: 'dataRilascio', label: 'Data SDS', kind: 'date' },
  { key: 'nomeFileImportato', label: 'Nome file importato', hint: 'file PDF o Excel da cui è stata importata la scheda', kind: 'file', readonly: true }
];

// Numero CAS: 2-7 cifre, 2 cifre, cifra di controllo (es. 64-17-5).
// La cifra di controllo esclude numeri EC (200-578-6) e indici CLP (607-021-00-X).
export function isValidCas(cas: string): boolean {
  const m = cas.match(/^(\d{2,7})-(\d{2})-(\d)$/);
  if (!m) return false;
  const digits = (m[1] + m[2]).split('').reverse();
  const sum = digits.reduce((acc, d, i) => acc + Number(d) * (i + 1), 0);
  return sum % 10 === Number(m[3]);
}

export function extractCas(value?: string | null): string[] {
  if (!value) return [];
  const found = value.match(/(?<![\d-])\d{2,7}-\d{2}-\d(?![\d-])/g) ?? [];
  return [...new Set(found.filter(isValidCas))];
}

// Divide un elenco di componenti su ";" o "," (non decimali e non dentro parentesi)
function splitComponents(value: string): string[] {
  const parts: string[] = [];
  let depth = 0, current = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    const separator = depth === 0 && (ch === ';' || ch === '\n' ||
      (ch === ',' && !(/\d/.test(value[i - 1] ?? '') && /\d/.test(value[i + 1] ?? ''))));
    if (separator) { parts.push(current + (ch === ',' ? ',' : '')); current = ''; } else { current += ch; }
  }
  parts.push(current);
  const pieces = parts.map(p => p.trim()).filter(p => p);

  // Una virgola può far parte del nome ("Sodio idrossido, solido (>98%)"): un pezzo senza
  // dati propri (%, CAS, "|") si unisce al successivo, se nell'elenco ci sono pezzi che li hanno
  const hasData = (p: string) => /%|\||\d{2,7}-\d{2}-\d/.test(p);
  if (!pieces.some(hasData)) return pieces.map(p => p.replace(/,$/, '').trim());
  const merged: string[] = [];
  let pending = '';
  for (const p of pieces) {
    if (!hasData(p)) { pending += p + ' '; continue; }
    merged.push((pending + p).replace(/,$/, '').trim());
    pending = '';
  }
  if (pending) merged.push(pending.replace(/,\s*$/, '').trim());
  return merged;
}

// Dal testo di un componente tiene solo il nome: via CAS, EC, indici e percentuali.
// I contenuti di ()/[] restano nel nome (es. "1,3-bis[12-idrossi-ottadecammide-N-metilene]-benzene"):
// si rimuovono solo i dati al loro interno e le parentesi che restano vuote.
function componentName(part: string): string {
  let name = part.includes('|') ? part.split('|')[0] : part;
  // I contenuti di ()/[] fanno parte del nome (es. "1,3-bis[12-idrossi-ottadecammide-N-metilene]-benzene"):
  // si rimuovono solo i dati al loro interno (CAS, EC, indici, percentuali) e poi le parentesi vuote
  name = name
    .replace(/(\(|\[)([^)\]]*)(\)|\])/g, (_m, open: string, inner: string, close: string) => {
      const cleaned = inner
        .replace(/\b(CAS|EC|CE|N\.?\s*CAS|N\.?\s*EC|Index|REACH)\b[^,;]*/gi, ' ')
        .replace(/\d+(?:[.,]\d+)?\s*(?:[<>≤≥]=?)\s*x\s*(?:[<>≤≥]=?)\s*\d+(?:[.,]\d+)?\s*%?/gi, ' ')
        .replace(/[<>≤≥=~]*\s*\d+(?:[.,]\d+)?\s*(?:-\s*[<>≤≥=]*\s*\d+(?:[.,]\d+)?)?\s*%/g, ' ')
        .replace(/\d{2,7}-\d{2}-\d|\d{3}-\d{3}-\d{1,2}(?:-[\dX]+)?/g, ' ');
      return cleaned.trim() ? open + cleaned + close : ' ';
    })
    .replace(/\b(CAS|EC|CE|N\.?\s*CAS|N\.?\s*EC|Index|REACH)\b[^,;]*/gi, ' ')
    // intervalli scritti come "30 ≤ x < 32,5 %" o "10 <= x <= 20"
    .replace(/\d+(?:[.,]\d+)?\s*(?:[<>≤≥]=?)\s*x\s*(?:[<>≤≥]=?)\s*\d+(?:[.,]\d+)?\s*%?/gi, ' ')
    .replace(/[<>≤≥=~]*\s*\d+(?:[.,]\d+)?\s*(?:-\s*[<>≤≥=]*\s*\d+(?:[.,]\d+)?)?\s*%/g, ' ')
    .replace(/\d{2,7}-\d{2}-\d|\d{3}-\d{3}-\d{1,2}(?:-[\dX]+)?/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,;:\-–]+|[\s,;:\-–]+$/g, '');
  return name;
}

export function componentNames(card: SafetyCard): string[] {
  const source = card.composizione || [card.composizioneCasSopra, card.composizioneCasSotto].filter(v => v).join(';');
  if (!source) return [];
  return [...new Set(splitComponents(source).map(componentName).filter(n => n && /[A-Za-zÀ-ÿ]/.test(n)))];
}

function parseNumbers(value: string): number[] {
  // Il "-" è un segno solo se non segue una cifra: "56-170" è un intervallo, "-10" un negativo
  const re = /(^|[^\d.,])(-?\d+(?:[.,]\d+)?)/g;
  const out: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    const raw = m[2].startsWith('-') && /\d/.test(m[1]) ? m[2].slice(1) : m[2];
    out.push(Number(raw.replace(',', '.')));
  }
  return out.filter(n => !isNaN(n));
}

const it = (n: number, decimals: number) =>
  n.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: decimals });

// Teb in °C, solo il valore minimo e senza unità (l'unità è nell'intestazione): "56-170°C" -> "56".
// Valori in °F o K vengono convertiti in °C.
export function minTeb(value?: string | null): string {
  if (!value) return '';
  const nums = parseNumbers(value);
  if (!nums.length) return value;
  const min = Math.min(...nums);
  const celsius = /°\s*F|\bF\b/.test(value) ? (min - 32) * 5 / 9
    : /\bK\b/.test(value) ? min - 273.15
    : min;
  return it(celsius, 1);
}

// Densità in g/cm³ (solo il numero: l'unità è nell'intestazione della colonna): kg/m³ e g/l si dividono per 1000; g/ml, kg/l, kg/dm³ e densità relativa restano uguali.
// Senza unità, valori oltre 10 sono considerati kg/m³.
export function densityGcm3(value?: string | null): string {
  if (!value) return '';
  const nums = parseNumbers(value);
  if (!nums.length) return value;
  const v = nums[0];
  const perThousand = /kg\s*\/\s*m\s*(³|3)|g\s*\/\s*l\b|g\s*\/\s*dm/i.test(value) && !/kg\s*\/\s*dm|kg\s*\/\s*l\b/i.test(value);
  const gcm3 = perThousand || (!/[a-z]/i.test(value) && v > 10) ? v / 1000 : v;
  return it(gcm3, 3);
}

// Pittogrammi del foglio "Pittogrammi" (immagini in public/ghs)
export const GHS_PICTOGRAMS: Record<string, string> = {
  GHS01: 'Esplosivo',
  GHS02: 'Infiammabile',
  GHS03: 'Comburente',
  GHS04: 'Gas sotto pressione',
  GHS05: 'Corrosivo',
  GHS06: 'Tossicità acuta (categorie 1, 2 e 3)',
  GHS07: 'Tossicità acuta (altre categorie), sensibilizzante cutaneo, irritante, narcotico',
  GHS08: 'Pericoloso per la salute: sensibilizzante respiratorio, mutageno, cancerogeno, tossico per la riproduzione',
  GHS09: "Pericoloso per l'ambiente"
};

// "H225,H319" o "GHS02, GHS07" -> un elemento per codice
export function splitCodes(value?: string | null): string[] {
  return value ? value.split(/[,;]/).map(v => v.trim()).filter(v => v) : [];
}

// Le composizioni arrivano come elenco separato da virgole o punto e virgola: una voce per riga
export function splitList(value?: string | null): string[] {
  return value ? value.split(/;|,(?=\s*[A-Za-zÀ-ÿ])/).map(v => v.trim()).filter(v => v) : [];
}

// Le indicazioni supplementari UE (EUH066, EUH208...) sono valide ma non sono nel foglio "Frasi H"
const isEuhCode = (code: string) => /^EUH\s*\d{3}[A-Za-z]?$/i.test(code.trim());

export function frasiHDescription(code: string): string {
  const entry = FRASI_H[code] ?? FRASI_H[code.replace(/\s+/g, '')];
  if (!entry) {
    return isEuhCode(code)
      ? 'Informazione supplementare sui pericoli (UE), non presente nel foglio "Frasi H"'
      : 'Codice non presente nel foglio "Frasi H"';
  }
  return entry.en ? `${entry.it} (${entry.en})` : entry.it ?? '';
}

export function isKnownHCode(code: string): boolean {
  return !!FRASI_H[code.replace(/\s+/g, '')] || isEuhCode(code);
}

export function normalizeGhs(code: string): string {
  const m = code.toUpperCase().match(/GHS\s*0?(\d{1,2})/);
  return m ? 'GHS' + m[1].padStart(2, '0') : code.trim();
}

export function ghsDescription(code: string): string | undefined {
  return GHS_PICTOGRAMS[normalizeGhs(code)];
}

export function sdsValue(card: SafetyCard, key: SdsFieldKey): unknown {
  return (card as unknown as Record<string, unknown>)[key];
}

// Intestazione di tabella e dettaglio: nome della colonna del file, con l'unità se il valore è convertito
export function columnLabel(field: SdsField): string {
  return field.unit ? `${field.label} (${field.unit})` : field.label;
}

// Campi "da verificare": l'import PDF non li ha ritrovati nel testo della SDS e non li ha inseriti
export function isToVerify(card: SafetyCard, key: string): boolean {
  return !!card.campiDaVerificare?.includes(key);
}

// Motivi del campo (una riga per motivo nelle note di verifica: "campo: motivo")
export function verifyReasons(card: SafetyCard, key: string): string[] {
  return (card.noteVerifica ?? '').split('\n')
    .filter(l => l.startsWith(key + ':'))
    .map(l => l.slice(key.length + 1).trim());
}

const EXTRA_LABELS: Record<string, string> = { numeroProtocollo: 'Versione / Revisione SDS', dataScadenza: 'Data Scadenza' };

export function fieldLabel(key: string): string {
  const f = SDS_FIELDS.find(x => x.key === key);
  return f ? columnLabel(f) : EXTRA_LABELS[key] ?? key;
}
