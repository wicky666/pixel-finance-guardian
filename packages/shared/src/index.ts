import { z } from "zod";

export const reviewStyleSchema = z.enum(["standard", "share"]);
export const reviewToneSchema = z.enum(["calm", "real", "sharp"]);

export const quoteSuggestionSchema = z.object({
  symbol: z.string(),
  shortName: z.string(),
  exchange: z.string().optional(),
});

export type ReviewStyle = z.infer<typeof reviewStyleSchema>;
export type ReviewTone = z.infer<typeof reviewToneSchema>;
export type QuoteSuggestion = z.infer<typeof quoteSuggestionSchema>;
