import type { PageLoad } from './$types';
import type { QuadletGenerateFormProps } from '/@/lib/forms/quadlet/quadlet-utils';

export const load: PageLoad = ({ url }): QuadletGenerateFormProps => {
  console.log('packages/frontend/src/routes/quadlets/generate LOAD', url.searchParams.entries());
  return {
    providerId: url.searchParams.get('providerId') ?? undefined,
    connection: url.searchParams.get('connection') ?? undefined,
    quadletType: url.searchParams.get('quadletType') ?? undefined,
    resourceId: url.searchParams.get('resourceId') ?? undefined,
  };
};
