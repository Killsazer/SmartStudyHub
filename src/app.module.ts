import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudyHubModule } from './study-hub.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [StudyHubModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
