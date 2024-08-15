import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import RedirectComponent from "./components/RedirectComponent";
import YAML from 'yaml'
import "./App.css";

import TablePage from "./components/TablePage";

function App() {
  const [redirectMap, setRedirectMap] = useState({});
  const location = useLocation();

  useEffect(() => {
    const loadUrlMap = async () => {
      const urlMap = await fetchUrlMap();
      setRedirectMap(urlMap);
    };
    loadUrlMap();
  }, []);

  // Find the matching URL and replace dynamic segments
  const getRedirectUrl = (pathname) => {
    // Iterate through all paths in the redirectMap
    for (const [pattern, url] of Object.entries(redirectMap)) {
      // Convert pattern to regex, replacing '/{$1}' with a capturing group
      const regexPattern = pattern.replace(/\/\{\$1\}/g, "/([^/]+)");
      const regex = new RegExp(`^${regexPattern}$`);
      const match = pathname.match(regex);

      if (match) {
        console.log(`Matched pattern: ${pattern}`);
        console.log(`Redirect URL before replacement: ${url}`);
        // Replace '{$1}' with the captured group
        return url.replace("{$1}", match[1]);
      }
    }
    return null;
  };

  // Utility function to trim trailing slash
  const trimTrailingSlash = (path) => {
    return path.replace(/\/$/, '');
  };

  const redirectUrl = getRedirectUrl(trimTrailingSlash(location.pathname));
  return (
    <Routes>
      <Route path="/" element={<TablePage />} />
      <Route
        path="*"
        element={
          redirectUrl ? (
            <RedirectComponent redirectUrl={redirectUrl} />
          ) : (
            <TablePage />
          )
        }
      />
    </Routes>
  );
}

// Function to fetch URL map configuration
const fetchUrlMap = async () => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/glnk.yaml`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    // Fetch the YAML file content as plain text
    const data = await response.text();
    return YAML.parse(data);
  } catch (error) {
    console.error("Failed to fetch YAML:", error);
    return {};
  }
};

export default App;
