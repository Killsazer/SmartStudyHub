import { Module } from '@nestjs/common';
import { NoteController } from './presentation/note.controller';
import { NoteService } from './application/note.service';
import { NotesPdfExportService } from './application/notes-pdf-export.service';
import { HtmlExportVisitor } from './domain/patterns/visitor/html-export.visitor';
import { PrismaNoteRepository } from './infrastructure/prisma-note.repository';

@Module({
  controllers: [NoteController],
  providers: [
    NoteService,
    NotesPdfExportService,
    HtmlExportVisitor,
    {
      provide: 'INoteRepository',
      useClass: PrismaNoteRepository,
    },
  ],
})
export class NotesModule {}
