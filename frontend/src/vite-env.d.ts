/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API (e.g., http://localhost:5000/api) */
  readonly VITE_API_BASE_URL: string;
  // Add other VITE_ prefixed env variables here as needed.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
