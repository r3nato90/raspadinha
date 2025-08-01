import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config"
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsService } from './accounts/accounts.service';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsModule } from './accounts/accounts.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { ScratchCardsModule } from './scratch-cards/scratch-cards.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ScratchGamesModule } from './scratch-games/scratch-games.module';
import { FinancialModule } from './financial/financial.module';
import { AffiliatesService } from './affiliates/affiliates.service';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { SettingsModule } from './settings/settings.module';
import { BannersModule } from './banners/banners.module';
import { WebhooksController } from './webhooks/webhooks.controller';
import { WebhooksService } from './webhooks/webhooks.service';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    AccountsModule,
    AuthModule,
    AdminModule,
    ScratchCardsModule,
    TransactionsModule,
    ScratchGamesModule,
    FinancialModule,
    AffiliatesModule,
    SettingsModule,
    BannersModule,
    WebhooksModule
  ],
  controllers: [AppController, WebhooksController],
  providers: [AppService, AffiliatesService, WebhooksService],
})
export class AppModule {}
