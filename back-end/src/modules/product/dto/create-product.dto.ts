import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'MacBook Pro 14"' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiPropertyOptional({ example: 'Apple M3 Pro chip, 18GB RAM' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 49990000 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @ApiPropertyOptional({ example: 'https://example.com/macbook.jpg' })
  @IsString()
  @IsOptional()
  defaultImage?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
