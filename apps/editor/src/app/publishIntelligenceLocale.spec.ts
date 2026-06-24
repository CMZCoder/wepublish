import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import de from './locales/de.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

const locales = { en, de, fr } as const;

const publishIntelligenceSources = [
  'libs/ai/editor/src/lib/publish-readiness-ai-review.tsx',
  'libs/ui/editor/src/lib/panel/publishDiscoveryMap.tsx',
  'libs/ui/editor/src/lib/panel/publishReadinessPanel.tsx',
  'libs/ui/editor/src/lib/panel/publishReadinessPanelWithAI.tsx',
];

const forbiddenSourceCopy = [
  'Publish Intelligence',
  'AI review',
  'AI review warnings',
  'Run AI review',
  'Retry AI review',
  'Reviewing',
  'Preparing editorial suggestions.',
  'Could not generate editorial suggestions. You can continue with the readiness checklist.',
  'Configure an AI provider to run editorial suggestions.',
  'Editorial guidance for search results, answer engines and citation-ready source context.',
  'Lead and answer',
  'SEO and social',
  'AEO/GEO clarity',
  'Editorial risks',
  'Current:',
  'Confidence:',
  'Discovery map',
  'Search preview',
  'Opening clarity',
  'Source trail',
  'Access model',
];

describe('Publish Intelligence editor locale', () => {
  it('keeps publish intelligence locale keys available for every editor language', () => {
    const expectedKeys = flattenKeys(en.translation.publishReadiness);

    for (const locale of Object.values(locales)) {
      expect(flattenKeys(locale.translation.publishReadiness)).toEqual(
        expectedKeys
      );

      expect(
        locale.translation.publishReadiness.aiReview.description
      ).toBeTruthy();
    }
  });

  it('keeps publish intelligence source copy locale-backed', () => {
    for (const sourcePath of publishIntelligenceSources) {
      const source = readFileSync(join(process.cwd(), sourcePath), 'utf8');

      for (const copy of forbiddenSourceCopy) {
        expect(source).not.toContain(copy);
      }
    }
  });

  it('keeps the real CMS publish panel editor-facing', () => {
    const publishReadiness = en.translation.publishReadiness;
    const localeText = JSON.stringify(publishReadiness);

    expect(publishReadiness.description).toMatch(
      /automatic checks highlight metadata/i
    );
    expect(publishReadiness.discovery.description).toMatch(
      /title, intro, sources and access settings/i
    );
    expect(publishReadiness.discovery.channels.answers.title).toBe(
      'Opening clarity'
    );
    expect(publishReadiness.discovery.channels.citations.title).toBe(
      'Source trail'
    );
    expect(localeText).not.toMatch(
      /deterministic proxy signals|answer surfaces|AI citation likelihood|Answer readiness|AI citation trail/i
    );
  });

  it('keeps Publish Intelligence copy free of internal implementation phrasing', () => {
    for (const locale of Object.values(locales)) {
      const localeText = JSON.stringify(locale.translation.publishReadiness);

      expect(localeText).not.toMatch(
        /deterministic checks|automatic checks remain|automatic checks stay|human review stays|required|contrôles automatiques restent|revue humaine reste|automatischen Checks bleiben|redaktionelle Prüfung bleibt/i
      );
    }
  });
});

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') {
    return [prefix];
  }

  return Object.entries(value)
    .flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key)
    )
    .sort();
}
