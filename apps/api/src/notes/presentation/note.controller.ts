import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Logger, Res } from '@nestjs/common';
import type { Response } from 'express';
import { NoteService } from '../application/note.service';
import { NotesPdfExportService } from '../application/notes-pdf-export.service';
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

  constructor(
    private readonly noteService: NoteService,
    private readonly pdfExportService: NotesPdfExportService,
  ) {}

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

  @Get('export/pdf')
  async exportAllNotesToPdf(
    @CurrentUser() userId: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Export all notes to PDF requested by user: ${userId}`);
    const roots = await this.noteService.getNotesComposite(userId);
    const pdf = await this.pdfExportService.exportTreeToPdf(roots, 'My Notes');
    this.sendPdf(res, pdf, 'notes.pdf');
  }

  @Get(':id/export/pdf')
  async exportNoteSubtreeToPdf(
    @CurrentUser() userId: string,
    @Param('id') noteId: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Export note subtree ${noteId} to PDF requested by user: ${userId}`);
    const subtree = await this.noteService.getSubtreeComposite(userId, noteId);
    const pdf = await this.pdfExportService.exportTreeToPdf([subtree], subtree.title);
    const safeName = subtree.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 60) || 'note';
    this.sendPdf(res, pdf, `${safeName}.pdf`);
  }

  private sendPdf(res: Response, pdf: Buffer, filename: string): void {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length.toString());
    res.end(pdf);
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
