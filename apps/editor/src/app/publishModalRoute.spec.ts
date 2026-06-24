import { readFileSync } from 'fs';
import { join } from 'path';

const appRoot = join(__dirname);

describe('editor publish modal routes', () => {
  it('uses a wide publish modal for the article and page review workflows', () => {
    const articleEditorSource = readFileSync(
      join(appRoot, 'routes/articles/articleEditor.tsx'),
      'utf8'
    );
    const pageEditorSource = readFileSync(
      join(appRoot, 'routes/pages/pageEditor.tsx'),
      'utf8'
    );

    expect(articleEditorSource).toMatch(
      /<Modal\s+open=\{isPublishDialogOpen\}\s+size="lg"[\s\S]*?<PublishArticlePanel/
    );
    expect(pageEditorSource).toMatch(
      /<Modal\s+open=\{isPublishDialogOpen\}\s+size="lg"[\s\S]*?<PublishPagePanel/
    );
  });
});
