declare module "@env" {
  export const GOOGLE_CLOUD_PROJECT_ID: string;
  export const GOOGLE_CLOUD_API_KEY: string;
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const AZURE_SPEECH_KEY: string;
  export const AZURE_SPEECH_REGION: string;
  /** Backend proxy URL for web builds — routes Azure Speech calls server-side so the key stays out of the browser bundle. */
  export const AZURE_PROXY_URL: string;
}
