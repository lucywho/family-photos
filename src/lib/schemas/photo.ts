import { z } from 'zod';
import { isValid, parse } from 'date-fns';

// Custom date validation for dd/mm/yyyy format
const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

const dateStringSchema = z
  .string()
  .regex(dateRegex, 'Date must be in dd/mm/yyyy format')
  .refine((date) => {
    if (!date) return true;
    const parsed = parse(date, 'dd/MM/yyyy', new Date());
    return isValid(parsed);
  }, 'Invalid date');

// Tag and Album name validation
const nameSchema = z.string().max(20, 'Maximum length is 20 characters').trim();

// Schema for editing a photo
export const photoEditSchema = z.object({
  title: z
    .string()
    .max(70, 'Title must be 70 characters or less')
    .trim()
    .optional()
    .transform((val) => val || null),

  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .trim()
    .optional()
    .transform((val) => val || null),

  date: dateStringSchema.optional().transform((val) => {
    if (!val) return null;
    return parse(val, 'dd/MM/yyyy', new Date());
  }),

  familyOnly: z.boolean().default(false),

  tags: z
    .array(nameSchema)
    .max(50, 'Too many tags') // Reasonable limit for tags
    .transform((tags) => [...new Set(tags)]), // Remove duplicates

  albums: z
    .array(
      z.object({
        id: z.number().optional(), // Optional for new albums
        name: nameSchema,
      })
    )
    .transform((albums) => {
      // Remove duplicates based on name
      return albums.filter(
        (album, index, self) =>
          index === self.findIndex((a) => a.name === album.name)
      );
    }),
});

// Type for the form data
export type PhotoEditFormData = z.input<typeof photoEditSchema>;

// Type for the validated data
export type ValidatedPhotoEdit = z.output<typeof photoEditSchema>;

// Type for the server response
export type PhotoEditResponse = {
  success: boolean;
  message: string;
  data?: ValidatedPhotoEdit;
  errors?: Record<string, string[]>;
};
