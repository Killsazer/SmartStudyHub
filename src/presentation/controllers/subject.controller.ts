import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SubjectQueryService } from '../../application/services/subject-query.service';
import { SubjectService } from '../../application/services/subject.service';
import { CreateSubjectDto } from '../dtos/create-subject.dto';

@Controller('subjects')
export class SubjectController {
  constructor(
    private readonly subjectQueryService: SubjectQueryService,
    private readonly subjectService: SubjectService
  ) {}

  @Get('user/:userId')
  async getUserSubjects(@Param('userId') userId: string) {
    const subjects = await this.subjectQueryService.getSubjectsByUser(userId);
    
    return {
      status: 'success',
      data: subjects
    };
  }

  @Post()
  async createSubject(
    @Body('userId') userId: string,
    @Body() dto: CreateSubjectDto
  ) {
    if (!userId) {
      return { status: 400, message: 'userId is required in the body.' };
    }
    
    await this.subjectService.createSubject(userId, dto);
    
    return {
      status: 'success',
      message: 'Subject created successfully'
    };
  }
}
