import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KvTtlCacheService } from '@wepublish/kv-ttl-cache/api';

import { OllamaPublishReadinessProvider } from './providers/ollama-publish-readiness.provider';
import { UnlimitedSurfPublishReadinessProvider } from './providers/unlimited-surf-publish-readiness.provider';
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
        return new PublishReadinessReviewService(
          createPublishReadinessProvider(prisma, kv)
        );
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

function createPublishReadinessProvider(
  prisma: PrismaClient,
  kv: KvTtlCacheService
) {
  switch (process.env['PUBLISH_READINESS_REVIEW_PROVIDER']) {
    case 'ollama':
      return new OllamaPublishReadinessProvider();

    case 'unlimited-surf':
      return new UnlimitedSurfPublishReadinessProvider();

    default:
      return new V0PublishReadinessProvider(prisma, kv);
  }
}
