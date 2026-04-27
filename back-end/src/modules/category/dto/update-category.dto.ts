import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Laptops' })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional({ example: 'All types of portable computers' })
  @IsString()
  @IsOptional()
  description?: string;
}
