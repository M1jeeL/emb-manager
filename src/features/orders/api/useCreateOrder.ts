import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/axios";

export interface CreateOrderItemLogoInput {
  logoId: string;
  logoName: string;
  unitPrice: number;
  placement?: string;
}

export interface CreateOrderItemInput {
  garmentId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  logos: CreateOrderItemLogoInput[];
}

export interface CreateOrderInput {
  organizationId: string;
  customerId: string;
  promisedAt?: string;
  notes?: string;
  items: CreateOrderItemInput[];
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (newOrder: CreateOrderInput) => {
      const { data } = await api.post("/orders", newOrder);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalida la lista de pedidos para refrescar los datos automáticamente
      queryClient.invalidateQueries({
        queryKey: ["orders", variables.organizationId],
      });
      navigate("/pedidos");
    },
  });
};
