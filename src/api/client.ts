import axios from 'axios';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql';

export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const { data } = await axios.post(GRAPHQL_URL, { query, variables }, { headers });

  if (data.errors?.length) {
    throw new Error(data.errors[0].message);
  }
  return data.data as T;
}
