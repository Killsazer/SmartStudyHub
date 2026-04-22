// File: src/subjects/presentation/subject.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SubjectService } from '../application/subject.service';
import { SubjectQueryService } from '../application/subject-query.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
    private readonly subjectQueryService: SubjectQueryService
  ) {}

  @Post()
  async createSubject(
    @CurrentUser() userId: string,
    @Body() dto: CreateSubjectDto
  ) {
    const subjectId = await this.subjectService.createSubject(userId, dto);
    return { status: 'success', data: { id: subjectId } };
  }

  @Get()
  async getSubjects(@CurrentUser() userId: string) {
    const subjects = await this.subjectQueryService.getSubjectsByUser(userId);
    return { status: 'success', data: subjects };
  }

  @Patch(':id')
  async updateSubject(
    @CurrentUser() userId: string,
    @Param('id') subjectId: string,
    @Body() dto: UpdateSubjectDto
  ) {
    await this.subjectService.updateSubject(userId, subjectId, dto);
    return { status: 'success', message: 'Subject updated successfully' };
  }

  @Delete(':id')
  async deleteSubject(
    @CurrentUser() userId: string,
    @Param('id') subjectId: string
  ) {
    await this.subjectService.deleteSubject(userId, subjectId);
    return { status: 'success', message: 'Subject deleted successfully' };
  }
}
