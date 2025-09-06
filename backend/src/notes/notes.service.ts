
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  list(params: { archived?: boolean; categoryId?: number }) {
    const { archived, categoryId } = params;
    return this.prisma.note.findMany({
      where: {
        archived: archived === undefined ? undefined : archived,
        categories: categoryId
          ? { some: { categoryId } }
          : undefined,
      },
      include: { categories: { include: { category: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  get(id: number) {
    return this.prisma.note.findUnique({
      where: { id },
      include: { categories: { include: { category: true } } },
    });
  }

  async create(dto: { title: string; content?: string; categoryIds?: number[] }) {
    return this.prisma.note.create({
      data: {
        title: dto.title,
        content: dto.content ?? null,
        categories: dto.categoryIds && dto.categoryIds.length
          ? { create: dto.categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
      include: { categories: { include: { category: true } } },
    });
  }

  async update(
    id: number,
    dto: { title?: string; content?: string; archived?: boolean; categoryIds?: number[] }
  ) {
    let categoriesOp = undefined as any;
    if (dto.categoryIds) {
      categoriesOp = {
        deleteMany: {},
        create: dto.categoryIds.map((categoryId) => ({ categoryId })),
      };
    }
    return this.prisma.note.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        archived: dto.archived,
        categories: categoriesOp,
      },
      include: { categories: { include: { category: true } } },
    });
  }

  async setCategories(id: number, categoryIds: number[]) {
    return this.prisma.note.update({
      where: { id },
      data: {
        categories: {
          deleteMany: {},
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
      include: { categories: { include: { category: true } } },
    });
  }

  remove(id: number) {
    return this.prisma.note.delete({ where: { id } });
  }
}
