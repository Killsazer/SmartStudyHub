// File: src/schedule/presentation/teacher.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TeacherService } from '../application/teacher.service';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { UpdateTeacherDto } from '../dtos/update-teacher.dto';
import { JwtAuthGuard } from '../../../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/security/current-user.decorator';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  async createTeacher(
    @CurrentUser() userId: string,
    @Body() dto: CreateTeacherDto,
  ) {
    const teacher = await this.teacherService.createTeacher(userId, dto);
    return { status: 'success', data: { id: teacher.id, name: teacher.name } };
  }

  @Get()
  async getTeachers(@CurrentUser() userId: string) {
    const teachers = await this.teacherService.getTeachers(userId);
    return { status: 'success', data: teachers };
  }

  @Patch(':id')
  async updateTeacher(
    @CurrentUser() userId: string,
    @Param('id') teacherId: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    await this.teacherService.updateTeacher(userId, teacherId, dto);
    return { status: 'success', message: 'Teacher updated successfully' };
  }

  @Delete(':id')
  async deleteTeacher(
    @CurrentUser() userId: string,
    @Param('id') teacherId: string,
  ) {
    await this.teacherService.deleteTeacher(userId, teacherId);
    return { status: 'success', message: 'Teacher deleted successfully' };
  }
}
