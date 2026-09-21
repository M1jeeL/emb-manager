import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/axios";
import type { Order } from "../types";

export const useGetOrders = (organizationId: string) => {
  return useQuery<Order[]>({
    queryKey: ["orders", organizationId],
    queryFn: async () => {
      const { data } = await api.get<Order[]>(
        `/orders?organizationId=${organizationId}`,
      );
      return data;
    },
    enabled: Boolean(organizationId),
  });
};
