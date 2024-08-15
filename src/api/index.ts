import YAML from "yaml";

const baseUrl = process.env.PUBLIC_URL;

export const fetchUrlMap = async () => {
  try {
    const response = await fetch(`${baseUrl}/glnk.yaml`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    // Fetch the YAML file content as plain text
    const data = await response.text();
    return YAML.parse(data) as Record<string, string>;
  } catch (error) {
    console.error("Failed to fetch YAML:", error);
    return {};
  }
};
