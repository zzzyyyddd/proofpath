import { boundedMultipart, errorResponse, requireFile } from '@/lib/server/http';
import { validateFile } from '@/lib/server/documents/validate';
import { ProofPathError } from '@/lib/shared/errors';

export const runtime = 'nodejs';
export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    const form = await boundedMultipart(request);
    const label = form.get('label');
    if (label !== 'old' && label !== 'new') throw new ProofPathError('INVALID_LABEL', 'Select an Old or New document label.', 400);
    if ([...form.keys()].some(key => !['file', 'label', 'uploadRevision'].includes(key))) throw new ProofPathError('INVALID_REQUEST', 'Unexpected upload fields.', 400);
    const document = await validateFile(requireFile(form, 'file'), label);
    return Response.json({ document }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); }
}
