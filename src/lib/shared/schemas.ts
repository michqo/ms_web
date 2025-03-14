import { z } from 'zod';

const usernameSchema = z.object({
  current_password: z.string().min(3).max(20),
  new_username: z.string().min(3).max(20),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});
type LoginSchema = z.infer<typeof loginSchema>;

export { usernameSchema, loginSchema, type LoginSchema };
