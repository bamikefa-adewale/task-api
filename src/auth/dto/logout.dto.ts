import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'No request body required. Access token should be provided in Authorization header.',
    example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  // No validation needed since we extract token from Authorization header
  // This is an empty class for documentation purposes
  _?: never; // Empty class marker
}
