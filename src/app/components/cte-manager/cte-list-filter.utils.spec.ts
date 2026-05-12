import { describe, expect, it } from 'vitest';
import {
  formatCentsAsBrl,
  normalizeText,
  parseBrlToCentavos,
  tryParseMoneyQueryToCentavos,
} from './cte-list-filter.utils';

describe('parseBrlToCentavos', () => {
  it('parses Brazilian format with thousands and cents', () => {
    expect(parseBrlToCentavos('R$ 1.234,56')).toBe(123456);
    expect(parseBrlToCentavos('1.234,56')).toBe(123456);
  });

  it('parses integer reais as centavos * 100', () => {
    expect(parseBrlToCentavos('R$ 10')).toBe(1000);
    expect(parseBrlToCentavos('10')).toBe(1000);
  });

  it('returns null for invalid or empty input', () => {
    expect(parseBrlToCentavos('')).toBeNull();
    expect(parseBrlToCentavos('abc')).toBeNull();
    expect(parseBrlToCentavos('R$ x')).toBeNull();
  });
});

describe('formatCentsAsBrl', () => {
  it('formats centavos with pt-BR grouping', () => {
    expect(formatCentsAsBrl(123456)).toBe('R$ 1.234,56');
    expect(formatCentsAsBrl(50)).toBe('R$ 0,50');
    expect(formatCentsAsBrl(0)).toBe('R$ 0,00');
  });
});

describe('tryParseMoneyQueryToCentavos', () => {
  it('parses plain money-like strings', () => {
    expect(tryParseMoneyQueryToCentavos('1100')).toBe(110000);
  });

  it('returns null for mixed text', () => {
    expect(tryParseMoneyQueryToCentavos('nf 1100')).toBeNull();
  });
});

describe('normalizeText', () => {
  it('strips accents and lowercases', () => {
    expect(normalizeText('  São Paulo  ')).toBe('sao paulo');
  });
});
