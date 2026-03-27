// File: src/notes/presentation/note.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { NoteService } from '../application/note.service';
import { CreateNoteDto } from './create-note.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  async createNote(
    @CurrentUser() userId: string,
    @Body() dto: CreateNoteDto
  ) {
    const note = await this.noteService.createNote(userId, dto);
    return { status: 'success', data: { id: note.id, title: note.title } };
  }

  @Get('tree')
  async getNotesTree(@CurrentUser() userId: string) {
    const tree = await this.noteService.getNotesTree(userId);
    return { status: 'success', data: tree };
  }
}
