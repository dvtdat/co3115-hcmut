import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReceivingMethod } from 'src/entities';

export class CreateOrderDto {
  @ApiProperty({ enum: ReceivingMethod, example: ReceivingMethod.DELIVERY })
  @IsEnum(ReceivingMethod)
  receivingMethod!: ReceivingMethod;

  @ApiPropertyOptional({ example: '123 Nguyen Hue, Q1, HCM' })
  @IsString()
  @IsOptional()
  shippingAddress?: string;
}
