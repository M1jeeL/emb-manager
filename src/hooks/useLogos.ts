import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { logosApi } from "../api/logos";

import type {
  CreateLogoFilePayload,
  CreateLogoPayload,
  CreateLogoVersionPayload,
  LogoFilters,
  LogoStatus,
  UpdateLogoPayload,
} from "../types";

export function useLogos(filters: LogoFilters = {}) {
  return useQuery({
    queryKey: ["logos", filters],
    queryFn: () => logosApi.findAll(filters),
    placeholderData: keepPreviousData,
  });
}

export function useLogo(id: string) {
  return useQuery({
    queryKey: ["logos", id],
    queryFn: () => logosApi.findOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLogoPayload) => logosApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["logos"],
      });
    },
  });
}

export function useUpdateLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLogoPayload }) =>
      logosApi.update(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["logos"],
      });

      queryClient.invalidateQueries({
        queryKey: ["logos", variables.id],
      });
    },
  });
}

export function useChangeLogoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LogoStatus }) =>
      logosApi.changeStatus(id, status),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["logos"],
      });

      queryClient.invalidateQueries({
        queryKey: ["logos", variables.id],
      });
    },
  });
}

export function useCreateLogoVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logoId,
      payload,
    }: {
      logoId: string;
      payload: CreateLogoVersionPayload;
    }) => logosApi.createVersion(logoId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["logos", variables.logoId],
      });
    },
  });
}

export function useUploadLogoFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logoId,
      versionId,
      file,
      payload,
    }: {
      logoId: string;
      versionId: string;
      file: File;
      payload: CreateLogoFilePayload;
    }) => logosApi.uploadFile(logoId, versionId, file, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["logos", variables.logoId],
      });
    },
  });
}

export function useDownloadLogoFile() {
  return useMutation({
    mutationFn: ({
      logoId,
      versionId,
      fileId,
    }: {
      logoId: string;
      versionId: string;
      fileId: string;
    }) => logosApi.getFileDownloadUrl(logoId, versionId, fileId),
  });
}

export function useDeleteLogoFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      logoId,
      versionId,
      fileId,
    }: {
      logoId: string;
      versionId: string;
      fileId: string;
    }) => logosApi.deleteFile(logoId, versionId, fileId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["logos", variables.logoId],
      });
    },
  });
}
