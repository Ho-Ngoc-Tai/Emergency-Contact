import { IsString, IsOptional, IsObject } from 'class-validator';

/**
 * DTO for subscribe event payload
 */
export class SubscribeDto {
  @IsString()
  topic: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}

/**
 * Response DTO for subscribe event ACK
 */
export class SubscribeResponseDto {
  success: boolean;
  message?: string;
  topic?: string;
}

/**
 * DTO for unsubscribe event payload
 */
export class UnsubscribeDto {
  @IsString()
  topic: string;
}

/**
 * Response DTO for unsubscribe event ACK
 */
export class UnsubscribeResponseDto {
  success: boolean;
  message?: string;
}
