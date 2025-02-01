import { z } from 'zod';

// Constants
export const Gender = {
  Male: 'Male',
  Female: 'Female',
  Other: 'Other'
} as const;


// Basic Data Schemas
export const DataSchema = z.object({
  age: z.number().optional(),
  birth_date: z.string().optional(),
  username: z.string().optional(),
  full_name: z.string().optional(),
  first_setup: z.boolean(),
  avatar_url: z.string().optional(),
  user_id: z.string(),
});

export const ImageUploadSchema = z.object({
  base64: z.string().optional(),
  uri: z.string(),
  mimeType: z.string().optional(),
  fileName: z.string().optional(),
});

export const ProfileDataSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().optional(),
  username: z.string().optional(),
  avatar: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other'] as const), // Fixed enum definition
  hobbies: z.array(z.string()),
  age: z.number().optional(),
  first_setup: z.boolean().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

// Response Schemas
export const UserInfoResponseSchema = z.object({
  count: z.any(),
  data: DataSchema,
  error: z.any(),
  status: z.number(),
  statusText: z.any(),
});

// Placeholder schemas - replace with actual implementations
const UserIdentitySchema = z.object({
  // Add your UserIdentity fields here
}).describe('UserIdentitySchema');

const AuthErrorSchema = z.object({
  // Add your AuthError fields here
}).describe('AuthErrorSchema');

export const UserIdentityResponseSchema = z.object({
  data: z.nullable(z.object({
    identities: z.array(UserIdentitySchema),
  })),
  error: z.nullable(AuthErrorSchema),
});

// Type inference
export type Data = z.infer<typeof DataSchema>;
export type UserInfoResponse = z.infer<typeof UserInfoResponseSchema>;
export type ImageUpload = z.infer<typeof ImageUploadSchema>;
export type ProfileData = z.infer<typeof ProfileDataSchema>;
export type UserIdentityResponse = z.infer<typeof UserIdentityResponseSchema>;
export type GenderType = typeof Gender[keyof typeof Gender];


