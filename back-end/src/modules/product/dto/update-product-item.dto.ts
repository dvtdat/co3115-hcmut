import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProductItemStatus } from 'src/entities';

export class UpdateProductItemDto {
  @ApiPropertyOptional({ example: 52990000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  specificPrice?: number;

  @ApiPropertyOptional({ example: 'https://example.com/macbook-silver.jpg' })
  @IsString()
  @IsOptional()
  imageURL?: string;

  @ApiPropertyOptional({ enum: ProductItemStatus, example: ProductItemStatus.AVAILABLE })
  @IsEnum(ProductItemStatus)
  @IsOptional()
  status?: ProductItemStatus;
}
