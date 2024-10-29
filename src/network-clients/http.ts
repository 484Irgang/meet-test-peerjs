type ClientResults<T> = {
  data: T;
  error?: Error;
};

const createApiClient = (
  baseUrl: string,
  config?: RequestInit
): (<T>(
  endpoint: string,
  options?: RequestInit
) => Promise<ClientResults<T>>) => {
  return async (endpoint: string, options = { ...config }) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  };
};

export default createApiClient;
