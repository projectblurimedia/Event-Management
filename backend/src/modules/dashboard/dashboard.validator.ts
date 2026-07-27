import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
