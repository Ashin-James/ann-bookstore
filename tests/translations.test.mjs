import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const translationsDir = path.resolve(__dirname, '../data/translations');

const expectedLanguages = [
  'en', 'es', 'fr', 'de', 'pt-BR', 'it', 'hi', 'ml', 'ta', 'ar', 'zh-Hans', 'ja', 'ko', 'ru'
];

describe('Translation Keys Integrity Suite', () => {
  const enPath = path.join(translationsDir, 'en.json');
  assert.ok(fs.existsSync(enPath), 'en.json must exist');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const enKeys = Object.keys(enData).filter((k) => !k.startsWith('_')).sort();

  test('English translation has a non-empty key set', () => {
    assert.ok(enKeys.length > 20, `English keys count (${enKeys.length}) must be substantial`);
  });

  for (const lang of expectedLanguages) {
    describe(`Language: ${lang}`, () => {
      const filePath = path.join(translationsDir, `${lang}.json`);

      test(`file ${lang}.json exists and is valid JSON`, () => {
        assert.ok(fs.existsSync(filePath), `Translation file ${lang}.json must exist`);
        const content = fs.readFileSync(filePath, 'utf-8');
        assert.doesNotThrow(() => JSON.parse(content));
      });

      if (lang !== 'en') {
        test(`file ${lang}.json contains DRAFT status banner`, () => {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          assert.equal(data._status, 'DRAFT: needs native-speaker review');
        });
      }

      test(`file ${lang}.json has all required keys matching English`, () => {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const currentKeys = Object.keys(data).filter((k) => !k.startsWith('_'));
        const missingKeys = enKeys.filter((k) => !currentKeys.includes(k));

        if (missingKeys.length > 0) {
          console.warn(`[WARN] Missing keys in ${lang}.json:`, missingKeys);
        }

        assert.equal(
          missingKeys.length,
          0,
          `Language ${lang} is missing keys: ${missingKeys.join(', ')}`
        );
      });
    });
  }
});
