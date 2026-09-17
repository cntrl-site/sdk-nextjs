import franc from 'franc-min';

// Maps the ISO 639-3 codes franc-min can detect to their ISO 639-1
// equivalent, since `lang` in the browser is conventionally two letters.
// Codes with no ISO 639-1 equivalent are passed through as-is — a bare
// ISO 639-3 code is still a valid BCP 47 language tag.
const ISO_639_3_TO_1: Record<string, string> = {
  arb: 'ar',
  azj: 'az',
  bel: 'be',
  bos: 'bs',
  bul: 'bg',
  ces: 'cs',
  deu: 'de',
  eng: 'en',
  fas: 'fa',
  fra: 'fr',
  hau: 'ha',
  hin: 'hi',
  hrv: 'hr',
  hun: 'hu',
  ibo: 'ig',
  ind: 'id',
  ita: 'it',
  jav: 'jv',
  kaz: 'kk',
  kin: 'rw',
  lin: 'ln',
  mar: 'mr',
  nep: 'ne',
  nld: 'nl',
  nya: 'ny',
  pol: 'pl',
  por: 'pt',
  ron: 'ro',
  run: 'rn',
  rus: 'ru',
  som: 'so',
  spa: 'es',
  srp: 'sr',
  sun: 'su',
  swe: 'sv',
  swh: 'sw',
  tgl: 'tl',
  tur: 'tr',
  ukr: 'uk',
  urd: 'ur',
  uzn: 'uz',
  vie: 'vi',
  yor: 'yo',
  zlm: 'ms',
  zul: 'zu'
};

// Below this many characters franc-min's own trigram model is unreliable
// (headings, labels, short captions) — leave `lang` unset so it inherits
// from the document instead of guessing wrong.
const MIN_DETECTABLE_LENGTH = 20;

export function detectLang(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length < MIN_DETECTABLE_LENGTH) return undefined;
  const code3 = franc(trimmed, { minLength: MIN_DETECTABLE_LENGTH });
  if (code3 === 'und') return undefined;
  return ISO_639_3_TO_1[code3] ?? code3;
}
