import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudyHubModule } from './study-hub.module';

@Module({
  imports: [StudyHubModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
