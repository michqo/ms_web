import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1).max(50)
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});
type LoginSchema = z.infer<typeof loginSchema>;

export { formSchema, loginSchema, type LoginSchema };
