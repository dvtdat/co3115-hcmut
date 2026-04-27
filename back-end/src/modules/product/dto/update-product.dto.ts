import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'MacBook Pro 14"' })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiPropertyOptional({ example: 'Apple M3 Pro chip, 18GB RAM' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 49990000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 'https://example.com/macbook.jpg' })
  @IsString()
  @IsOptional()
  defaultImage?: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
