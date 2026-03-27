import { Controller, Get, Param } from '@nestjs/common';
import { SubjectQueryService } from '../../application/services/subject-query.service';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectQueryService: SubjectQueryService) {}

  @Get('user/:userId')
  async getUserSubjects(@Param('userId') userId: string) {
    const subjects = await this.subjectQueryService.getSubjectsByUser(userId);
    
    return {
      status: 'success',
      data: subjects
    };
  }
}
