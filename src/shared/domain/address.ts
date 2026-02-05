import { IsOptional, IsPostalCode, IsString } from 'class-validator';

export class Address {
  @IsString()
  street: string;

  @IsOptional()
  additionalInformations: string;

  @IsString()
  city: string;

  @IsPostalCode('any')
  zipCode: string;

  @IsString()
  country: string;
}
