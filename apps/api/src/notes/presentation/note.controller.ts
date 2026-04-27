import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { NoteService } from '../application/note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';
import { ApiResponse } from '../../shared/types/api-response.interface';
import { NoteEntity } from '../domain/note.entity';
import { INoteNode } from '../domain/patterns/composite/note-component';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NoteController {
  private readonly logger = new Logger(NoteController.name);

  constructor(private readonly noteService: NoteService) {}

  @Post()
  async createNote(
    @CurrentUser() userId: string,
    @Body() dto: CreateNoteDto,
  ): Promise<ApiResponse<NoteEntity>> {
    this.logger.log(`Create note request from user: ${userId}`);
    const note = await this.noteService.createNote(userId, dto);
    return { status: 'success', data: note };
  }

  @Get('tree')
  async getNotesTree(@CurrentUser() userId: string): Promise<ApiResponse<INoteNode[]>> {
    const tree = await this.noteService.getNotesTree(userId);
    return { status: 'success', data: tree };
  }

  @Patch(':id')
  async updateNote(
    @CurrentUser() userId: string,
    @Param('id') noteId: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<ApiResponse<NoteEntity>> {
    const note = await this.noteService.updateNote(userId, noteId, dto);
    return { status: 'success', data: note };
  }

  @Delete(':id')
  async deleteNote(
    @CurrentUser() userId: string,
    @Param('id') noteId: string,
  ): Promise<ApiResponse> {
    await this.noteService.deleteNote(userId, noteId);
    return { status: 'success', message: 'Note deleted successfully' };
  }
}
