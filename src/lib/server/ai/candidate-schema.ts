import { z } from 'zod';
import { candidateResponseSchema } from '../../shared/contracts';

export const candidateJsonSchema = z.toJSONSchema(candidateResponseSchema, { target: 'draft-7' });
