export const mempoolFeeColors = [ // LTCbrand: mempool block colours
  '0BAF6E', // green
  '20C572',
  '40C884',
  '2BCF74',
  '36DA76',
  '36DA76',
  '41E578',
  '4CEF7A',
  '57FA7C',
  '62FF7E',
  '6DFF7F',
  '79FF7E',
  '84FF7D',
  '8FFF7C',
  '9AFF7A',
  'FFEBA1', // yellow
  'ffe68a',
  'FFDF6C',
  'FFD53E',
  'ffd333',
  'fdc500',
  'FDB963',
  'C9A5FF',
  'be8aff', // purple
  'B071FF',
  'A35AFF',
  '9447f6',
  '8423FF',
  '9447f6',
  'A54DC3', // transition reds
  'D57AA5',
  'E6A29C',
  'ff8e8e', // red
  'ff6464',
  'ff4b4b',
  'ff3232',
  'f62626',
  'ff0000'
];

export const chartColors = [
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
  '#43A047',
  '#7CB342',
  '#C0CA33',
  '#FDD835',
  '#FFB300',
  '#FB8C00',
  '#F4511E',
  '#6D4C41',
  '#757575',
  '#546E7A',
  '#b71c1c',
  '#880E4F',
  '#4A148C',
  '#311B92',
  '#1A237E',
  '#0D47A1',
  '#01579B',
  '#006064',
  '#004D40',
  '#1B5E20',
  '#33691E',
  '#827717',
  '#F57F17',
  '#FF6F00',
  '#E65100',
  '#BF360C',
  '#3E2723',
  '#212121',
  '#263238',
  '#801313',
];

export const poolsColor = {
  'unknown': '#FDD835',
};

export const feeLevels = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200,
  250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000];

export interface Language {
  code: string;
  name: string;
}

export const languages: Language[] = [
   { code: 'ar', name: 'العربية' },         // Arabic
// { code: 'bg', name: 'Български' },       // Bulgarian
// { code: 'bs', name: 'Bosanski' },        // Bosnian
// { code: 'ca', name: 'Català' },          // Catalan
   { code: 'cs', name: 'Čeština' },         // Czech
   { code: 'da', name: 'Dansk' },           // Danish
   { code: 'de', name: 'Deutsch' },         // German
// { code: 'et', name: 'Eesti' },           // Estonian
// { code: 'el', name: 'Ελληνικά' },        // Greek
   { code: 'en', name: 'English' },         // English
   { code: 'es', name: 'Español' },         // Spanish
// { code: 'eo', name: 'Esperanto' },       // Esperanto
// { code: 'eu', name: 'Euskara' },         // Basque
   { code: 'fa', name: 'فارسی' },           // Persian
   { code: 'fr', name: 'Français' },        // French
// { code: 'gl', name: 'Galego' },          // Galician
   { code: 'ko', name: '한국어' },          // Korean
// { code: 'hr', name: 'Hrvatski' },        // Croatian
// { code: 'id', name: 'Bahasa Indonesia' },// Indonesian
   { code: 'hi', name: 'हिन्दी' },             // Hindi
   { code: 'ne', name: 'नेपाली' },            // Nepalese
   { code: 'it', name: 'Italiano' },        // Italian
   { code: 'he', name: 'עברית' },           // Hebrew
   { code: 'ka', name: 'ქართული' },         // Georgian
// { code: 'lv', name: 'Latviešu' },        // Latvian
   { code: 'lt', name: 'Lietuvių' },        // Lithuanian
   { code: 'hu', name: 'Magyar' },          // Hungarian
   { code: 'mk', name: 'Македонски' },      // Macedonian
// { code: 'ms', name: 'Bahasa Melayu' },   // Malay
   { code: 'nl', name: 'Nederlands' },      // Dutch
   { code: 'ja', name: '日本語' },          // Japanese
   { code: 'nb', name: 'Norsk' },           // Norwegian Bokmål
// { code: 'nn', name: 'Norsk Nynorsk' },   // Norwegian Nynorsk
   { code: 'pl', name: 'Polski' },          // Polish
   { code: 'pt', name: 'Português' },       // Portuguese
// { code: 'pt-BR', name: 'Português (Brazil)' }, // Portuguese (Brazil)
   { code: 'ro', name: 'Română' },          // Romanian
   { code: 'ru', name: 'Русский' },         // Russian
// { code: 'sk', name: 'Slovenčina' },      // Slovak
   { code: 'sl', name: 'Slovenščina' },     // Slovenian
// { code: 'sr', name: 'Српски / srpski' }, // Serbian
// { code: 'sh', name: 'Srpskohrvatski / српскохрватски' },// Serbo-Croatian
   { code: 'fi', name: 'Suomi' },           // Finnish
   { code: 'sv', name: 'Svenska' },         // Swedish
   { code: 'th', name: 'ไทย' },             // Thai
   { code: 'tr', name: 'Türkçe' },          // Turkish
   { code: 'uk', name: 'Українська' },      // Ukrainian
   { code: 'vi', name: 'Tiếng Việt' },      // Vietnamese
   { code: 'zh', name: '中文' },            // Chinese
];

export const fiatCurrencies = {
  AUD: {
    name: 'Australian Dollar',
    code: 'AUD',
    indexed: true,
  },
  EUR: {
    name: 'Euro',
    code: 'EUR',
    indexed: true,
  },
  GBP: {
    name: 'Pound Sterling',
    code: 'GBP',
    indexed: true,
  },
  JPY: {
    name: 'Japanese Yen',
    code: 'JPY',
    indexed: true,
  },
  USD: {
    name: 'US Dollar',
    code: 'USD',
    indexed: true,
  },
};

// Definition für die Struktur der Werte in specialBlocks
interface SpecialBlockInfo {
  labelEvent: string;
  labelEventCompleted: string;
  networks: string[];
}

export const specialBlocks: { [height: number]: SpecialBlockInfo } = {
  0: { // Genesis Block als Beispiel, falls benötigt
    labelEvent: 'Genesis',
    labelEventCompleted: 'The Genesis of Bit',
    networks: ['mainnet', 'testnet'],
  },
  100000: {
    labelEvent: 'Bit\'s 1st Halving',
    labelEventCompleted: 'Block Subsidy has halved to 2.5 B1T per block',
    networks: ['mainnet', 'testnet'],
  },
  200000: {
    labelEvent: 'Bit\'s 2nd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 1.25 B1T per block',
    networks: ['mainnet', 'testnet'],
  },
  278000: { // 200000 + 78000
    labelEvent: 'Bit\'s 3rd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.625 B1T per block',
    networks: ['mainnet', 'testnet'],
  },
  356000: { // 200000 + 2 * 78000
    labelEvent: 'Bit\'s 4th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.3125 B1T per block',
    networks: ['mainnet', 'testnet'],
  },
  434000: { // 200000 + 3 * 78000
    labelEvent: 'Bit\'s 5th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.15625 B1T per block',
    networks: ['mainnet', 'testnet'],
  },
  512000: { // 200000 + 4 * 78000
    labelEvent: 'Bit\'s 6th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.078125 B1T per block',
    networks: ['mainnet', 'testnet'],
  },
  // Add more events if needed
};
