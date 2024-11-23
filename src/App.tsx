import { Route, Routes, useLocation } from "react-router-dom";
import RedirectComponent from "./components/RedirectComponent";
import "./App.css";

import Footer from "./components/Footer";
import TablePage from "./pages/TablePage";
import { getRedirectUrl, trimTrailingSlash } from "./lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchUrlMap } from "./api";

function App() {
  const location = useLocation();

  const { data: redirectMap } = useQuery({
    queryKey: ["url_map"],
    queryFn: fetchUrlMap,
    initialData: {},
  });

  const redirectUrl = getRedirectUrl(
    redirectMap,
    trimTrailingSlash(location.pathname)
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<TablePage redirectMap={redirectMap} />} />
        <Route
          path="*"
          element={
            redirectUrl ? (
              <RedirectComponent redirectUrl={redirectUrl} />
            ) : (
              <TablePage redirectMap={redirectMap} />
            )
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
