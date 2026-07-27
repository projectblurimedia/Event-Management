import { z } from 'zod';

export const createFaqSchema = z.object({
  question: z.string().min(1),
  questionTe: z.string().optional(),
  answer: z.string().min(1),
  answerTe: z.string().optional(),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});
export const updateFaqSchema = createFaqSchema.partial();
