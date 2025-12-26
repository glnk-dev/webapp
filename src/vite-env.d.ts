/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GLNK_ACCESS_MODE: string
  readonly VITE_GLNK_USERNAME: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
