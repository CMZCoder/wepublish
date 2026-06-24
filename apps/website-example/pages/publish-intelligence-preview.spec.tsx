import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pagePath = join(__dirname, 'publish-intelligence-preview.tsx');

describe('Publish Intelligence real app preview route', () => {
  it('keeps the preview inside the website-example app route without fighting the Article content grid', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain(
      "import { PublishReadinessPanel } from '@wepublish/ui/editor';"
    );
    expect(source).toContain('function PublishIntelligencePreviewPage');
    expect(source).toContain('data-preview-kind="publish-intelligence"');
    expect(source).toContain('<PublishReadinessPanel');
    expect(source).toContain('export const getStaticProps');
    expect(source).not.toContain(
      "import { Article } from '@wepublish/article/website';"
    );
    expect(source).not.toContain('<Article');
    expect(source).not.toContain('showPaywall');
    expect(source).not.toContain('hideContent');
    expect(source).not.toContain('website-example Next app');
    expect(source).not.toContain('Route: /publish-intelligence-preview');
    expect(source).not.toContain('Review before publication');
    expect(source).not.toContain('focused writing desk');
    expect(source).not.toContain('checking discoverability');
    expect(source).not.toContain('answer readiness');
    expect(source).not.toContain('source clarity');
    expect(source).not.toContain('article remains readable');
    expect(source).not.toContain('signals reviewed next');
    expect(source).not.toContain('answer surfaces');
    expect(source).not.toContain('reader experience');
    expect(source).not.toContain('without disturbing the reader experience');
    expect(source).not.toContain('@wepublish/storybook');
    expect(source).not.toContain('iframe.html');
  });
});
