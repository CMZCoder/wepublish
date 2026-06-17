import { Args, Query, Resolver } from '@nestjs/graphql';
import { Chat, PromptHTMLArgs } from './v0.model';
import { ChatsCreateResponse, createClient } from 'v0-sdk';
import { Permissions } from '@wepublish/permissions/api';
import { CanCreateArticle, CanCreatePage } from '@wepublish/permissions';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { KvTtlCacheService } from '@wepublish/kv-ttl-cache/api';
import { V0Config } from './v0.config';

@Resolver()
export class V0Resolver {
  private async getV0Client() {
    const config = new V0Config(this.prisma, this.kv, 'v0');
    const apiKey = await config.apiKey();

    if (!apiKey) {
      throw new Error('V0 API key required');
    }

    return createClient({
      apiKey,
    });
  }

  constructor(
    private prisma: PrismaClient,
    private kv: KvTtlCacheService
  ) {}

  @Permissions(CanCreateArticle, CanCreatePage)
  @Query(() => Chat)
  async promptHTML(@Args() { query, chatId }: PromptHTMLArgs): Promise<Chat> {
    const v0 = await this.getV0Client();
    const config = new V0Config(this.prisma, this.kv, 'v0');
    let systemPrompt = await config.systemPrompt();
    if (!systemPrompt) {
      systemPrompt = '';
    }

    const chat =
      !chatId ?
        await v0.chats.create({
          message: query.trim(),
          system: systemPrompt.trim(),
          responseMode: 'sync',
          modelConfiguration: {
            thinking: false,
          },
        })
      : await v0.chats.sendMessage({
          chatId,
          message: query.trim(),
          responseMode: 'sync',
          modelConfiguration: {
            thinking: false,
          },
        });

    const [result] = (chat as ChatsCreateResponse).messages.flatMap(msg =>
      msg.experimental_content?.flatMap(content => {
        const messages = content[1] as Array<
          [string, { lang: string }, string]
        >;

        return (
          messages.find(
            ([type, config]) => type === 'Codeblock' && config.lang === 'html'
          )?.[2] ?? []
        );
      })
    );

    if (!result) {
      throw new BadRequestException('No HTML returned by v0');
    }

    return {
      chatId: (chat as ChatsCreateResponse).id,
      message: result,
    };
  }
}
