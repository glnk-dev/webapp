export interface RedirectMap {
  [key: string]: string;
}

export interface TablePageProps {
  redirectMap: RedirectMap;
}

export interface URLGeneratorProps {
  subpath: string;
  template: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId?: string;
}
