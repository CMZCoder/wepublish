import { parameters } from './parameters';

describe('storybook parameters', () => {
  it('exposes the i18next instance under the key required by storybook-react-i18next', () => {
    expect(parameters.i18n).toBe(parameters.i18);
  });
});
