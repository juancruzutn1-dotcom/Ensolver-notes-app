
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(
    @Query('archived') archived?: string,
    @Query('categoryId') categoryId?: string
  ) {
    return this.notes.list({
      archived: archived === undefined ? undefined : archived === 'true',
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.notes.get(parseInt(id, 10));
  }

  @Post()
  create(@Body() dto: { title: string; content?: string; categoryIds?: number[] }) {
    return this.notes.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: { title?: string; content?: string; archived?: boolean; categoryIds?: number[] }
  ) {
    return this.notes.update(parseInt(id, 10), dto);
  }

  @Patch(':id/archive')
  toggleArchive(@Param('id') id: string, @Body() dto: { archived: boolean }) {
    return this.notes.update(parseInt(id, 10), { archived: dto.archived });
  }

  @Patch(':id/categories')
  setCategories(@Param('id') id: string, @Body() dto: { categoryIds: number[] }) {
    return this.notes.setCategories(parseInt(id, 10), dto.categoryIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notes.remove(parseInt(id, 10));
  }
}
