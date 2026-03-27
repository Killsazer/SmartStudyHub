import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubjectQueryService } from '../../application/services/subject-query.service';
import { SubjectService } from '../../application/services/subject.service';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectController {
  constructor(
    private readonly subjectQueryService: SubjectQueryService,
    private readonly subjectService: SubjectService
  ) {}

  @Get()
  async getUserSubjects(@CurrentUser() userId: string) {
    const subjects = await this.subjectQueryService.getSubjectsByUser(userId);
    
    return {
      status: 'success',
      data: subjects
    };
  }

  @Post()
  async createSubject(
    @CurrentUser() userId: string,
    @Body() dto: CreateSubjectDto
  ) {
    const subjectId = await this.subjectService.createSubject(userId, dto);
    
    return {
      status: 'success',
      message: 'Subject created successfully',
      data: { id: subjectId }
    };
  }
}
