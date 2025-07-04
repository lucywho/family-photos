import { z } from 'zod';
import { isValid, parse } from 'date-fns';
import {
  MAX_TITLE_LENGTH,
  MAX_TAGS,
  MAX_NOTES_LENGTH,
  MAX_ALBUM_NAME_LENGTH,
  MAX_TAG_LENGTH,
} from '../../shared/constants';

// Custom date validation for dd/mm/yyyy format
const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

const dateStringSchema = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val))
  .refine((val) => !val || dateRegex.test(val), {
    message: 'Date must be in dd/mm/yyyy format',
  })
  .refine((val) => !val || isValid(parse(val, 'dd/MM/yyyy', new Date())), {
    message: 'Invalid date',
  });

// Tag and Album name validation
const albumNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(
    MAX_ALBUM_NAME_LENGTH,
    `Maximum length is ${MAX_ALBUM_NAME_LENGTH} characters`
  )
  .trim();

const tagNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(MAX_TAG_LENGTH, `Maximum length is ${MAX_TAG_LENGTH} characters`)
  .trim();

// Schema for editing a photo
export const photoEditSchema = z.object({
  title: z
    .string()
    .max(
      MAX_TITLE_LENGTH,
      `Title must be ${MAX_TITLE_LENGTH} characters or less`
    )
    .trim()
    .optional()
    .transform((val) => val || null),

  notes: z
    .string()
    .max(
      MAX_NOTES_LENGTH,
      `Notes must be ${MAX_NOTES_LENGTH} characters or less`
    )
    .trim()
    .optional()
    .transform((val) => val || null),

  date: dateStringSchema.optional().transform((val) => {
    if (!val) return null;
    return parse(val, 'dd/MM/yyyy', new Date());
  }),

  familyOnly: z.boolean().default(false),

  tags: z
    .array(tagNameSchema)
    .max(MAX_TAGS, 'Too many tags') // Reasonable limit for tags
    .transform((tags) => {
      // Remove duplicates, case-insensitive
      const seen = new Set<string>();
      return tags.filter((tag) => {
        const lower = tag.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
    }),

  albums: z
    .array(
      z.object({
        id: z.number().optional(), // Optional for new albums
        name: albumNameSchema,
      })
    )
    .transform((albums) => {
      // Remove duplicates based on name, case-insensitive
      const seen = new Set<string>();
      return albums.filter((album) => {
        const lower = album.name.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
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
