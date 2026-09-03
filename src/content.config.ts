// Content collections: artworks (per-piece markdown) + settings (single JSON).
import { defineCollection, z } from 'astro:content';

const artworks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    number: z.string(),
    image: z.string(),
    breedteCm: z.number().positive(),
    hoogteCm: z.number().positive(),
    minimumprijs: z.number().positive(),
    orientatie: z.enum(['liggend', 'staand', 'vierkant']).default('liggend'),
    materiaal: z.string().optional(),
  }),
});

const story = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lead: z.string(),
  }),
});

const settings = defineCollection({
  type: 'data',
  schema: z.object({
    siteTitle: z.string().default('Kunst voor Nepal'),
    tikkieUrl: z.string().url(),
    contactEmail: z.string().email(),
    footerNote: z.string().default('Alle opbrengsten gaan naar de slachtoffers van de overstromingen in Nepal en hun families.'),
  }),
});

export const collections = { artworks, story, settings };
