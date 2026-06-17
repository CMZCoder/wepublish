# Publish Intelligence AI Review Local Provider Proof

This proof path is for local development only. Production editor traffic still
uses WePublish GraphQL and server-side provider credentials.

## Ollama Cloud Free Path

1. Confirm the CLI exists:

   ```bash
   ollama --version
   ```

2. Sign in interactively if needed:

   ```bash
   ollama signin
   ```

3. Start or reuse the local Ollama server:

   ```bash
   ollama serve
   ```

4. In a separate shell, check that the cloud model is available:

   ```bash
   ollama run gpt-oss:20b-cloud "Return JSON: {\"summary\":\"ok\",\"suggestions\":[],\"warnings\":[]}"
   ```

5. Start the API with the local dev provider:

   ```bash
   PUBLISH_READINESS_REVIEW_PROVIDER=ollama OLLAMA_MODEL=gpt-oss:20b-cloud npm run watch:api-example
   ```

6. Run the editor and open an article/page publish modal. Click "Run AI review".

## Expected Result

The AI review lane returns suggestions or a clear provider error. The
deterministic publish score remains visible and unchanged.

## Storybook Visual Proof

Local screenshots are stored outside the repository at:

```text
/home/void/CodexScreenshots/wepublish-publish-intelligence-ai-review/
```

Captured states:

- `ai-ready-desktop.png`
- `ai-reviewing-desktop.png`
- `ai-suggestions-desktop.png`
- `ai-provider-error-desktop.png`
- `ai-suggestions-mobile.png`

The Storybook route is `Editor/Publish Intelligence`. The visual proof checks
that deterministic proxy checks stay visible, the AI review lane is clearly
non-blocking editorial guidance, the human-review disclaimer remains present,
and the mobile state has no horizontal overflow.
