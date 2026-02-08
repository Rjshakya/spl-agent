import { create } from "zustand";

export interface Connection {
  id: string;
  connectionString: string;
  source: string;
  name?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConnectionStore {
  connections: Connection[];
  selectedConnectionId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setConnections: (connections: Connection[]) => void;
  selectConnection: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors
  getSelectedConnection: () => Connection | undefined;
  getSelectedConnectionId: () => string | undefined;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  selectedConnectionId: null,
  isLoading: false,
  error: null,

  setConnections: (connections) => set({ connections }),
  selectConnection: (id) => set({ selectedConnectionId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  getSelectedConnection: () => {
    const { connections, selectedConnectionId } = get();
    return connections.find((c) => c.id === selectedConnectionId);
  },

  getSelectedConnectionId: () => {
    return get().selectedConnectionId ?? undefined;
  },
}));
