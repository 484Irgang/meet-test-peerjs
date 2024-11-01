type ClientResults<T> = {
  data: T | null;
  error?: Error;
};

const createApiClient = (
  baseUrl: string,
  config?: RequestInit
): (<T>(
  endpoint: string,
  options?: RequestInit
) => Promise<ClientResults<T>>) => {
  const initialConfig = config;

  return async (endpoint: string, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...initialConfig?.headers,
    };

    const config = {
      ...initialConfig,
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();

      return { data };
    } catch (error) {
      console.error("Erro na requisição:", error);
      return { data: null, error: error as unknown as Error };
    }
  };
};

export default createApiClient;
