import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { SubjectService } from '../application/subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';
import { ApiResponse } from '../../shared/types/api-response.interface';
import { SubjectEntity } from '../domain/subject.entity';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectController {
  private readonly logger = new Logger(SubjectController.name);

  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  async createSubject(
    @CurrentUser() userId: string,
    @Body() dto: CreateSubjectDto,
  ): Promise<ApiResponse<SubjectEntity>> {
    this.logger.log(`Create subject request from user: ${userId}`);
    const subject = await this.subjectService.createSubject(userId, dto);
    return { status: 'success', data: subject };
  }

  @Get()
  async getSubjects(@CurrentUser() userId: string): Promise<ApiResponse<SubjectEntity[]>> {
    const subjects = await this.subjectService.getSubjectsByUser(userId);
    return { status: 'success', data: subjects };
  }

  @Patch(':id')
  async updateSubject(
    @CurrentUser() userId: string,
    @Param('id') subjectId: string,
    @Body() dto: UpdateSubjectDto,
  ): Promise<ApiResponse<SubjectEntity>> {
    const subject = await this.subjectService.updateSubject(userId, subjectId, dto);
    return { status: 'success', message: 'Subject updated successfully', data: subject };
  }

  @Delete(':id')
  async deleteSubject(
    @CurrentUser() userId: string,
    @Param('id') subjectId: string,
  ): Promise<ApiResponse> {
    await this.subjectService.deleteSubject(userId, subjectId);
    return { status: 'success', message: 'Subject deleted successfully' };
  }
}