import { z } from 'zod';

const usernameSchema = z.object({
  current_password: z.string().min(3).max(20),
  new_username: z.string().min(3).max(20),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(3).max(20),
    new_password: z.string().min(3).max(20),
    confirm_password: z.string().min(3).max(20),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});
type LoginSchema = z.infer<typeof loginSchema>;

export { loginSchema, passwordSchema, usernameSchema, type LoginSchema };
