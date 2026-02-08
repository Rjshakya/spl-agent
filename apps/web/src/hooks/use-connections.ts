import client from "@/hc";
import useSwr, { mutate } from "swr";

export type CreateConnection = {
  userId: string;
  name: string;
  connectionString: string;
  source: string;
};

export const useConnections = () => {
  const fetcher = () => getUserConnections();
  const { data, error, isLoading } = useSwr("user:connections", fetcher);

  return {
    connections: data,
    connectionsError: error,
    connectionsLoading: isLoading,
  };
};

export const getUserConnections = async () => {
  const res = await client.api.connection.my.$get();
  if (!res.ok) throw new Error("failed to get connections");

  const data = await res.json();
  return data.data;
};

export const createNewConnection = async (params: CreateConnection) => {
  const res = await client.api.connection.$post({ json: params });
  if (!res.ok) throw new Error("failed to create new connection");

  const response = await res.json();
  mutate("user:connections");
  return response.data;
};

export const deleteConnection = async (connectionId: string) => {
  const res = await client.api.connection[":connectionId"].$delete({
    param: { connectionId },
  });
  if (!res.ok) throw new Error("failed to create new connection");

  const response = await res.json();
  mutate("user:connections");
  return response.data;
};
