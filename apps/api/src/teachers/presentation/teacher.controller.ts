import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { TeacherService } from '../application/teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';  
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';
import { ApiResponse } from '../../shared/types/api-response.interface';
import { TeacherEntity } from '../domain/teacher.entity';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  private readonly logger = new Logger(TeacherController.name);

  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  async createTeacher(
    @CurrentUser() userId: string,
    @Body() dto: CreateTeacherDto,
  ): Promise<ApiResponse<TeacherEntity>> {
    this.logger.log(`Create teacher request from user: ${userId}`);
    const teacher = await this.teacherService.createTeacher(userId, dto);
    return { status: 'success', data: teacher };
  }

  @Get()
  async getTeachers(@CurrentUser() userId: string): Promise<ApiResponse<TeacherEntity[]>> {
    const teachers = await this.teacherService.getTeachers(userId);
    return { status: 'success', data: teachers };
  }

  @Patch(':id')
  async updateTeacher(
    @CurrentUser() userId: string,
    @Param('id') teacherId: string,
    @Body() dto: UpdateTeacherDto,
  ): Promise<ApiResponse<TeacherEntity>> {
    const updatedTeacher = await this.teacherService.updateTeacher(userId, teacherId, dto);
    return { status: 'success', data: updatedTeacher };
  }

  @Delete(':id')
  async deleteTeacher(
    @CurrentUser() userId: string,
    @Param('id') teacherId: string,
  ): Promise<ApiResponse> {
    await this.teacherService.deleteTeacher(userId, teacherId);
    return { status: 'success', message: 'Teacher deleted successfully' };
  }
}