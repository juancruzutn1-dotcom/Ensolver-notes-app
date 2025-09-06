import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  async list() {
    return this.service.list();
  }

  @Post()
  async create(@Body('name') name: string) {
    return this.service.create(name);
  }
}
