// File: src/presentation/controllers/note.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { NoteService } from '../../application/services/note.service';
import { CreateNoteDto } from '../dtos/create-note.dto';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

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
