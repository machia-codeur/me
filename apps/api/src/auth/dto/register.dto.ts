import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss1' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Kouadio' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Aya' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'CI', required: false })
  @IsString()
  @IsOptional()
  country?: string;
}
