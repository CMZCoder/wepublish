import type { PublishReadinessReviewInput } from '../publish-readiness-review.model';
import type { PublishReadinessReviewProvider } from '../publish-readiness-review.provider';

export class OllamaPublishReadinessProvider
  implements PublishReadinessReviewProvider
{
  readonly name = 'ollama';

  constructor(
    private readonly host = process.env['OLLAMA_HOST'] ??
      'http://127.0.0.1:11434',
    readonly model = process.env['OLLAMA_MODEL'] ?? 'gpt-oss:20b-cloud'
  ) {}

  async review(
    _input: PublishReadinessReviewInput,
    prompt: string
  ): Promise<string> {
    const response = await fetch(`${this.host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama review failed with ${response.status}`);
    }

    const data = (await response.json()) as {
      message?: { content?: string };
      response?: string;
    };

    return data.message?.content ?? data.response ?? '';
  }
}
