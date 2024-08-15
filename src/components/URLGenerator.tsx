import { useState } from "react";

const extractVariables = (template: string) => {
  const pattern = /\{([^}]+)\}/g;
  const extractedVars = [];
  let match;
  while ((match = pattern.exec(template)) !== null) {
    extractedVars.push(match[1]);
  }
  return extractedVars;
};

const generateUrl = (template: string, varMap: Record<string, string>) => {
  let result = template;
  Object.entries(varMap).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, value.length !== 0 ? value : key);
  });
  return result;
};

const URLGenerator = (props: { template: string }) => {
  const { template } = props;
  const variables = extractVariables(template);

  const [varMap, setVarMap] = useState(() => {
    const ret: Record<string, string> = {};
    variables.forEach((v) => {
      ret[v] = "";
    });
    return ret;
  });

  const generatedUrl = generateUrl(template, varMap);

  return (
    <div>
      {variables.map((v) => {
        return (
          <div>
            <input
              key={v}
              value={varMap[v]}
              placeholder={v}
              onChange={(ev) => {
                setVarMap((prev) => {
                  return {
                    ...prev,
                    [v]: ev.target.value,
                  };
                });
              }}
            />
          </div>
        );
      })}
      <a href={generatedUrl} className="text-blue-500 hover:underline">
        {generatedUrl}
      </a>
    </div>
  );
};

export default URLGenerator;
