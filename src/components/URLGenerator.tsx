import { useState } from "react";

const extractVariables = (template: string) => {
  const pattern = /\{([^}]+)\}/g;
  const extractedVars: string[] = [];
  let match;
  while ((match = pattern.exec(template)) !== null) {
    extractedVars.push(`{${match[1]}}`);
  }
  return extractedVars;
};

const generateUrl = (template: string, varMap: Record<string, string>) => {
  return Object.entries(varMap).reduce(
    (result, [key, value]) => result.replace(key, value || key),
    template
  );
};

const URLGenerator = ({
  subpath,
  template,
}: {
  subpath: string;
  template: string;
}) => {
  const variables = extractVariables(template);

  const [varMap, setVarMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(variables.map((v) => [v, ""]))
  );

  const generatedUrl = generateUrl(template, varMap);
  const generatedSubpath = generateUrl(subpath, varMap);
  const publicUrl = process.env.PUBLIC_URL || "";

  const handleInputChange =
    (key: string) => (ev: React.ChangeEvent<HTMLInputElement>) => {
      setVarMap((prev) => ({ ...prev, [key]: ev.target.value }));
    };

  return (
    <tr key={subpath}>
      <td className="border-t py-2 px-4 flex flex-col">
        {variables.map((v) => (
          <input
            key={v}
            value={varMap[v]}
            placeholder={v}
            onChange={handleInputChange(v)}
          />
        ))}
        <a
          href={`${publicUrl}${generatedSubpath}`}
          className="text-blue-500 hover:underline"
        >
          {generatedSubpath}
        </a>
      </td>
      <td className="border-t py-2 px-4">
        <a href={generatedUrl} className="text-blue-500 hover:underline">
          {generatedUrl}
        </a>
      </td>
    </tr>
  );
};

export default URLGenerator;
