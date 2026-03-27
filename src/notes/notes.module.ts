// File: src/notes/notes.module.ts
import { Module } from '@nestjs/common';
import { NoteController } from './presentation/note.controller';
import { NoteService } from './application/note.service';
import { PrismaNoteRepository } from './infrastructure/prisma-note.repository';

@Module({
  controllers: [NoteController],
  providers: [
    NoteService,
    {
      provide: 'INoteRepository',
      useClass: PrismaNoteRepository,
    },
  ],
})
export class NotesModule {}
