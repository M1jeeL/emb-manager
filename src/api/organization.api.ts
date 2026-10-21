import { apiRequest } from './client';

export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
}

export type OrganizationUpdate = Omit<OrganizationSettings, 'id' | 'slug'>;

export const organizationApi = {
  getCurrent: () => apiRequest<OrganizationSettings>('/organization/current'),
  updateCurrent: (payload: OrganizationUpdate) => apiRequest<OrganizationSettings>('/organization/current', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),
};
