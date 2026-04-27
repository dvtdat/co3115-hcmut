import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Laptops' })
  @IsString()
  @IsNotEmpty()
  categoryName!: string;

  @ApiPropertyOptional({ example: 'All types of portable computers' })
  @IsString()
  @IsOptional()
  description?: string;
}
