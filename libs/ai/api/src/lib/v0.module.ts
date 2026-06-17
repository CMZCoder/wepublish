import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KvTtlCacheService } from '@wepublish/kv-ttl-cache/api';

import { OllamaPublishReadinessProvider } from './providers/ollama-publish-readiness.provider';
import { V0PublishReadinessProvider } from './providers/v0-publish-readiness.provider';
import { PublishReadinessReviewResolver } from './publish-readiness-review.resolver';
import { PublishReadinessReviewService } from './publish-readiness-review.service';
import { V0Resolver } from './v0.resolver';

@Module({
  providers: [
    V0Resolver,
    PublishReadinessReviewResolver,
    {
      provide: PublishReadinessReviewService,
      inject: [PrismaClient, KvTtlCacheService],
      useFactory: (prisma: PrismaClient, kv: KvTtlCacheService) => {
        const provider =
          process.env['PUBLISH_READINESS_REVIEW_PROVIDER'] === 'ollama' ?
            new OllamaPublishReadinessProvider()
          : new V0PublishReadinessProvider(prisma, kv);

        return new PublishReadinessReviewService(provider);
      },
    },
  ],
  exports: [
    V0Resolver,
    PublishReadinessReviewResolver,
    PublishReadinessReviewService,
  ],
})
export class V0Module {
  public static register(): DynamicModule {
    return {
      module: V0Module,
    };
  }

  public static registerAsync(
    options: Pick<ModuleMetadata, 'imports'>
  ): DynamicModule {
    return {
      module: V0Module,
      imports: options.imports || [],
    };
  }
}
