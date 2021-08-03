import { IsInt, IsOptional, IsString } from 'class-validator';

export class StationOperationDto {
  // for StartTransaction & Authorize
  //@IsString()
  idTag?: string;

  // for StopTransaction
  //@IsString()
  transactionId?: string;

  
  connectorId?: string;

  
  meterStart?: string;

  
  timestamp?: string;
  
}
