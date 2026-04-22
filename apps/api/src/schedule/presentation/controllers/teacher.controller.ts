import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TeacherService } from '../../application/services/teacher.service';
import { CreateTeacherDto } from '../dto/teacher/create-teacher.dto';
import { UpdateTeacherDto } from '../dto/teacher/update-teacher.dto';  
import { JwtAuthGuard } from '../../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../../shared/security/current-user.decorator';

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
    // 💡 Повертаємо всю сутність для зручності фронтенду
    return { status: 'success', data: teacher };
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
    const updatedTeacher = await this.teacherService.updateTeacher(userId, teacherId, dto);
    return { status: 'success', data: updatedTeacher };
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