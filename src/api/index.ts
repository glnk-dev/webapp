import YAML from 'yaml';
import { RedirectMap } from '../types';
import { YAML_FILE_PATH } from '../constants';
import { getPublicUrl } from '../utils/env';

export const fetchUrlMap = async (): Promise<RedirectMap> => {
  try {
    const baseUrl = getPublicUrl();
    const response = await fetch(`${baseUrl}${YAML_FILE_PATH}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch YAML: ${response.status} ${response.statusText}`);
    }

    const data = await response.text();
    return YAML.parse(data) as RedirectMap;
  } catch (error) {
    console.error('Failed to fetch YAML:', error);
    return {};
  }
};
