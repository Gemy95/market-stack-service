import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateHoldingDto {
  @ApiProperty({ example: 'AAPL', description: 'Stock ticker symbol' })
  @IsNotEmpty()
  @IsString()
  ticker: string;

  @ApiProperty({ example: 10, description: 'units', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  units?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
