import React, { useEffect, useState } from "react";
import YAML from 'yaml'

const TablePage = () => {
  const [links, setLinks] = useState([]);
  const glnkUsername = process.env.REACT_APP_GLNK_USERNAME || "defaultUsername";
  const publicUrl = process.env.PUBLIC_URL || "";

  useEffect(() => {
    const urlMapFile = `${process.env.PUBLIC_URL}/glnk.yaml`;
    // Fetch the YAML file from the public directory
    fetch(urlMapFile)
      .then((response) => response.text())
      .then((data) => {
        // Convert YAML to array of objects for easier table rendering
        const objArray = Object.entries(YAML.parse(data))
        const linkArray = objArray.map(([key, value]) => ({
          subpath: key,
          redirectLink: value,
        }));
        setLinks(linkArray);
      })
      .catch((error) => console.error("Error fetching URL map:", error));
  }, []);

  return (
    <div className="App container mx-auto p-4 bg-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Go Links -{" "}
          <a
            href={process.env.PUBLIC_URL}
            className="text-blue-500 hover:underline"
          >
            {glnkUsername}.glnk.dev
          </a>
        </h1>
        <p className="mt-2 text-lg">
          Easily manage your custom short links with{" "}
          <a href="https://glnk.dev" className="text-blue-500 hover:underline">
            glnk.dev
          </a>
          .<br />
          Get your custom URL before it's too late—register{" "}
          <a
            href="https://glnk.dev/register"
            className="text-blue-500 hover:underline"
          >
            here
          </a>{" "}
          now!
        </p>
      </header>
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">
              Subpath
            </th>
            <th className="py-2 px-4 bg-gray-200 font-semibold text-gray-700">
              Redirect Link
            </th>
          </tr>
        </thead>
        <tbody className="text-left">
          {links.map(({ subpath, redirectLink }) => (
            <tr key={subpath}>
              <td className="border-t py-2 px-4">
                <a
                  href={`${publicUrl}${subpath}`}
                  className="text-blue-500 hover:underline"
                >
                  {subpath}
                </a>
              </td>
              <td className="border-t py-2 px-4">
                <a
                  href={redirectLink}
                  className="text-blue-500 hover:underline"
                >
                  {redirectLink}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablePage;
