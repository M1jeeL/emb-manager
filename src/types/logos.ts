export type LogoStatus = "ACTIVE" | "ARCHIVED";

export type LogoFileType = "IMAGE" | "EMBROIDERY";

export interface Logo {
  id: string;
  organizationId: string;
  customerId: string | null;

  name: string;
  description: string | null;

  status: LogoStatus;
  currentPrice: string;

  createdAt: string;
  updatedAt: string;

  customer: {
    id: string;
    name: string;
  } | null;
}

export interface LogoListResponse {
  data: Logo[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LogoFilters {
  page?: number;
  limit?: number;
  name?: string;
  customerId?: string;
  status?: LogoStatus;
}

export interface CreateLogoPayload {
  name: string;
  description?: string;
  customerId?: string;
  currentPrice?: string;
}

export type UpdateLogoPayload = Partial<CreateLogoPayload> & {
  customerId?: string | null;
};

export interface LogoVersion {
  id: string;
  logoId: string;
  version: number;

  widthMm: string | null;
  heightMm: string | null;
  stitchCount: number | null;

  notes: string | null;

  createdAt: string;

  files: LogoFile[];
}

export interface LogoFile {
  id: string;
  logoVersionId: string;

  type: LogoFileType;
  format: string;

  fileName: string;
  mimeType: string | null;
  fileSize: string | null;

  isPrimary: boolean;

  createdAt: string;
}

export interface LogoPriceHistory {
  id: string;
  logoId: string;

  price: string;
  createdAt: string;
}

export interface CreateLogoVersionPayload {
  widthMm?: string;
  heightMm?: string;
  stitchCount?: number;
  notes?: string;
}
export interface CreateLogoFilePayload {
  type: LogoFileType;
  format: string;
  isPrimary?: boolean;
}

export interface LogoFileDownloadResponse {
  url: string;
  fileName: string;
  mimeType: string | null;
  expiresIn: number;
}
