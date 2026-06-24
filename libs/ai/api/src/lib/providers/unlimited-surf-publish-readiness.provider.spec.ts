import {
  fetchUnlimitedSurfApiKey,
  normalizeUnlimitedSurfBaseURL,
  resolveUnlimitedSurfReviewModels,
  resolveUnlimitedSurfMaxAttempts,
  resolveUnlimitedSurfMaxTokens,
  resolveUnlimitedSurfModel,
  resolveUnlimitedSurfRetryDelayMs,
  UnlimitedSurfPublishReadinessProvider,
} from './unlimited-surf-publish-readiness.provider';

describe('UnlimitedSurfPublishReadinessProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('normalizes the Unlimited Surf base URL and default Claude Sonnet model', () => {
    expect(normalizeUnlimitedSurfBaseURL('https://unlimited.surf')).toBe(
      'https://unlimited.surf/v1'
    );
    expect(normalizeUnlimitedSurfBaseURL('https://unlimited.surf/v1/')).toBe(
      'https://unlimited.surf/v1'
    );
    expect(resolveUnlimitedSurfModel()).toBe('claude-sonnet-4-6-20260101');
    expect(resolveUnlimitedSurfModel('unlimited-surf/claude-sonnet-4-6')).toBe(
      'claude-sonnet-4-6'
    );
    expect(
      resolveUnlimitedSurfReviewModels({
        PUBLISH_READINESS_UNLIMITED_SURF_MODEL: 'claude-sonnet-4-6-20260101',
      })
    ).toEqual([
      'claude-sonnet-4-6-20260101',
      'claude-opus-4-8-20260501',
      'claude-opus-4-7-20260101',
      'claude-opus-4-6-20251201',
      'claude-opus-4-5-20251101',
      'gpt-5.5',
      'gpt-5.4',
      'gpt-5.4-mini',
      'gpt-5.2',
    ]);
    expect(
      resolveUnlimitedSurfReviewModels({
        PUBLISH_READINESS_UNLIMITED_SURF_MODELS: [
          'unlimited-surf/gpt-5.4-mini',
          'claude-opus-4-1-20250805',
          'claude-opus-4-5-20251101',
          'gpt-5.1',
          'gpt-5.2',
        ].join(','),
      })
    ).toEqual(['gpt-5.4-mini', 'claude-opus-4-5-20251101', 'gpt-5.2']);
    expect(resolveUnlimitedSurfMaxTokens(undefined)).toBe(420);
    expect(resolveUnlimitedSurfMaxTokens('900')).toBe(900);
    expect(resolveUnlimitedSurfMaxTokens('2000')).toBe(420);
    expect(resolveUnlimitedSurfMaxAttempts(undefined)).toBe(3);
    expect(resolveUnlimitedSurfMaxAttempts('5')).toBe(5);
    expect(resolveUnlimitedSurfMaxAttempts('9')).toBe(3);
    expect(resolveUnlimitedSurfRetryDelayMs(undefined)).toBe(750);
    expect(resolveUnlimitedSurfRetryDelayMs('0')).toBe(0);
    expect(resolveUnlimitedSurfRetryDelayMs('6000')).toBe(750);
  });

  it('sends publish readiness prompts to the Anthropic-compatible messages endpoint', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                summary: 'The article is almost ready.',
                suggestions: [],
                warnings: [],
              }),
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const provider = new UnlimitedSurfPublishReadinessProvider({
      apiKey: 'surf-test-key',
      baseURL: 'https://unlimited.surf',
      model: 'unlimited-surf/claude-sonnet-4-6',
    });

    await expect(
      provider.review({} as never, 'Return JSON only.')
    ).resolves.toMatchObject({
      content: expect.stringContaining('The article is almost ready.'),
      model: 'claude-sonnet-4-6',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://unlimited.surf/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer surf-test-key',
          'x-api-key': 'surf-test-key',
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({
      model: 'claude-sonnet-4-6',
      max_tokens: 420,
      temperature: 0,
      system: expect.stringContaining('Return only minified JSON'),
      tool_choice: { type: 'tool', name: 'publish_readiness_review' },
      tools: [
        expect.objectContaining({
          name: 'publish_readiness_review',
        }),
      ],
      messages: [{ role: 'user', content: 'Return JSON only.' }],
    });
  });

  it('returns structured tool-use input when the gateway provides it', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [
            {
              type: 'tool_use',
              id: 'toolu_123',
              name: 'publish_readiness_review',
              input: {
                summary: 'The article is ready.',
                suggestions: [],
                warnings: [],
              },
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const provider = new UnlimitedSurfPublishReadinessProvider({
      apiKey: 'surf-test-key',
      baseURL: 'https://unlimited.surf',
    });

    await expect(
      provider.review({} as never, 'Return JSON only.')
    ).resolves.toEqual({
      content: JSON.stringify({
        summary: 'The article is ready.',
        suggestions: [],
        warnings: [],
      }),
      model: 'claude-sonnet-4-6-20260101',
    });
  });

  it('unwraps fenced JSON returned by the Unlimited Surf Claude gateway', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [
            {
              type: 'text',
              text: [
                '```json',
                JSON.stringify({
                  summary: 'The article is ready.',
                  suggestions: [],
                  warnings: [],
                }),
                '```',
              ].join('\n'),
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    );

    const provider = new UnlimitedSurfPublishReadinessProvider({
      apiKey: 'surf-test-key',
      baseURL: 'https://unlimited.surf',
    });

    await expect(
      provider.review({} as never, 'Return JSON only.')
    ).resolves.toEqual({
      content: JSON.stringify({
        summary: 'The article is ready.',
        suggestions: [],
        warnings: [],
      }),
      model: 'claude-sonnet-4-6-20260101',
    });
  });

  it('can fetch a launcher-compatible key without exposing it in errors', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ key: 'surf-fresh-key' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    await expect(fetchUnlimitedSurfApiKey({})).resolves.toBe('surf-fresh-key');
    expect(fetch).toHaveBeenCalledWith('https://unlimited.surf/api/key');
  });

  it('retries transient gateway failures before returning a review', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response('<html>bad gateway</html>', { status: 502 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: [
              {
                type: 'tool_use',
                id: 'toolu_123',
                name: 'publish_readiness_review',
                input: {
                  summary: 'The article is ready.',
                  suggestions: [],
                  warnings: [],
                },
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      );

    const provider = new UnlimitedSurfPublishReadinessProvider({
      apiKey: 'surf-test-key',
      baseURL: 'https://unlimited.surf',
      retryDelayMs: 0,
    });

    await expect(provider.review({} as never, 'Prompt')).resolves.toMatchObject(
      {
        content: expect.stringContaining('The article is ready.'),
        model: 'claude-sonnet-4-6-20260101',
      }
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('falls back to the next approved model after transient model failures', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response('<html>bad gateway</html>', { status: 502 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: [
              {
                type: 'tool_use',
                id: 'toolu_123',
                name: 'publish_readiness_review',
                input: {
                  summary: 'The helper model reviewed it.',
                  suggestions: [],
                  warnings: [],
                },
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      );

    const provider = new UnlimitedSurfPublishReadinessProvider({
      apiKey: 'surf-test-key',
      baseURL: 'https://unlimited.surf',
      env: {
        PUBLISH_READINESS_UNLIMITED_SURF_MODELS:
          'claude-sonnet-4-6-20260101,gpt-5.5',
      },
      maxAttempts: 1,
      retryDelayMs: 0,
    });

    await expect(provider.review({} as never, 'Prompt')).resolves.toMatchObject(
      {
        content: expect.stringContaining('The helper model reviewed it.'),
        model: 'gpt-5.5',
      }
    );
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body)).model).toBe(
      'claude-sonnet-4-6-20260101'
    );
    expect(JSON.parse(String(fetch.mock.calls[1][1]?.body)).model).toBe(
      'gpt-5.5'
    );
  });

  it('falls back when a model returns non-json content', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: [
              {
                type: 'text',
                text: 'I can help improve this article, but I need more context.',
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: [
              {
                type: 'tool_use',
                id: 'toolu_123',
                name: 'publish_readiness_review',
                input: {
                  summary: 'Fallback produced valid JSON.',
                  suggestions: [],
                  warnings: [],
                },
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      );

    const provider = new UnlimitedSurfPublishReadinessProvider({
      apiKey: 'surf-test-key',
      baseURL: 'https://unlimited.surf',
      env: {
        PUBLISH_READINESS_UNLIMITED_SURF_MODELS:
          'claude-sonnet-4-6-20260101,gpt-5.5',
      },
      maxAttempts: 1,
      retryDelayMs: 0,
    });

    await expect(provider.review({} as never, 'Prompt')).resolves.toMatchObject(
      {
        content: expect.stringContaining('Fallback produced valid JSON.'),
        model: 'gpt-5.5',
      }
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('throws a bounded error when the gateway refuses the review request', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('nope', { status: 401 }));

    const provider = new UnlimitedSurfPublishReadinessProvider({
      apiKey: 'surf-test-key',
      baseURL: 'https://unlimited.surf',
      retryDelayMs: 0,
    });

    await expect(provider.review({} as never, 'Prompt')).rejects.toThrow(
      'Unlimited Surf review failed with 401'
    );
  });
});
