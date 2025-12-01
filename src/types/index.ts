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

