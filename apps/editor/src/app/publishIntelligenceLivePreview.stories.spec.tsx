import '@testing-library/jest-dom';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const storyPath = join(__dirname, 'publishIntelligenceLivePreview.stories.tsx');

describe('Publish Intelligence live preview stories', () => {
  it('wires the live previews to real WePublish React components instead of static HTML copies', () => {
    const source = readFileSync(storyPath, 'utf8');

    expect(source).toContain(
      "import { Article } from '@wepublish/article/website';"
    );
    expect(source).toContain(
      "import { PublishReadinessPanel } from '@wepublish/ui/editor';"
    );
    expect(source).toContain('<Article');
    expect(source).toContain('<PublishReadinessPanel');
    expect(source).toContain('showPaywall={paywalled}');
    expect(source).toContain('hideContent={paywalled}');
    expect(source).toContain('paywall: paywalled ? activePaywall : null');
    expect(source).not.toContain('pi-root');
    expect(source).not.toContain('wepublish-preview.css');
  });
});
