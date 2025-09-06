
import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';


@Module({
  
  imports: [CategoriesModule,PrismaModule, NotesModule, CategoriesModule],
})
export class AppModule {}
