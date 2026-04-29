/**
 * Validation contracts for the auth forms — the single source of truth
 * shared by login/register pages and their mutation hooks.
 */
import { z } from 'zod'

const REQUIRED = 'This field is required'

export const loginSchema = z.object({
  username: z.string().trim().min(1, REQUIRED),
  password: z.string().min(1, REQUIRED),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(150, 'Username must be at most 150 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type RegisterInput = z.infer<typeof registerSchema>
