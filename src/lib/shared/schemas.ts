import { z } from 'zod';

const usernameSchema = z.object({
	current_password: z.string().min(3).max(20),
	new_username: z.string().min(3).max(20)
});
type UsernameSchema = z.infer<typeof usernameSchema>;

const passwordSchema = z
	.object({
		current_password: z.string().min(3).max(20),
		new_password: z.string().min(3).max(20),
		confirm_password: z.string().min(3).max(20)
	})
	.refine((data) => data.new_password === data.confirm_password, {
		message: 'Passwords do not match',
		path: ['confirm_password']
	});
type PasswordSchema = z.infer<typeof passwordSchema>;

const loginSchema = z.object({
	username: z.string(),
	password: z.string()
});
type LoginSchema = z.infer<typeof loginSchema>;

const deleteSchema = z.object({
	current_password: z.string().min(3).max(20)
});
type DeleteSchema = z.infer<typeof deleteSchema>;

const stationSchema = z.object({
	name: z.string().min(1, 'Station name is required'),
	latitude: z.coerce
		.number()
		.min(-90, 'Latitude must be between -90 and 90')
		.max(90, 'Latitude must be between -90 and 90'),
	longitude: z.coerce
		.number()
		.min(-180, 'Longitude must be between -180 and 180')
		.max(180, 'Longitude must be between -180 and 180')
});
type StationSchema = z.infer<typeof stationSchema>;

export {
	deleteSchema,
	loginSchema,
	passwordSchema,
	stationSchema,
	usernameSchema,
	type DeleteSchema,
	type LoginSchema,
	type PasswordSchema,
	type StationSchema,
	type UsernameSchema
};
