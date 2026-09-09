// تحويل رقم لكتابة المبلغ بالحروف بالعربي - زي ما بيتكتب في الأذون الرسمية
// بيدعم لحد المليارات، وبيتعامل مع الجنيه والقرش (جزء عشري لحد رقمين)

const ones = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
];
const tens = [
  '',
  'عشرة',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون',
];
const teens = [
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];
const hundreds = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة',
];

function threeDigits(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;

  if (h > 0) parts.push(hundreds[h]);

  if (rest >= 10 && rest < 20) {
    parts.push(teens[rest - 10]);
  } else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (o > 0) parts.push(ones[o]);
    if (t > 0) parts.push(tens[t]);
  }

  return parts.join(' و');
}

const scales = ['', 'ألف', 'مليون', 'مليار'];

function integerToWords(n: number): string {
  if (n === 0) return 'صفر';

  const groups: number[] = [];
  let remaining = n;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;
    let groupWords = threeDigits(g);
    if (i > 0) {
      // "ألف" و"مليون" مفردهم مختلف عن الجمع - بنبسطها هنا لصيغة واحدة مقروءة وواضحة
      if (g === 1) groupWords = scales[i];
      else if (g === 2) groupWords = scales[i] === 'ألف' ? 'ألفان' : `${scales[i]}ان`;
      else groupWords = `${groupWords} ${scales[i]}`;
    }
    parts.push(groupWords);
  }

  return parts.join(' و');
}

export function amountToArabicWords(amount: number, currency = 'جنيه'): string {
  const rounded = Math.round(Math.abs(amount) * 100) / 100;
  const integerPart = Math.floor(rounded);
  const fractionPart = Math.round((rounded - integerPart) * 100);

  let result = `${integerToWords(integerPart)} ${currency}`;
  if (fractionPart > 0) {
    result += ` و${integerToWords(fractionPart)} قرش`;
  }
  result += ' فقط لا غير';

  return result;
}
