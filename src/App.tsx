import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import RedirectComponent from './components/RedirectComponent';
import './App.css';
import TablePage from './pages/TablePage';
import HomePage from './pages/HomePage';
import ClipPage from './pages/ClipPage';
import { getRedirectUrl, trimTrailingSlash } from './utils/url';
import { useQuery } from '@tanstack/react-query';
import { fetchUrlMap } from './api';
import { QUERY_KEYS } from './constants';
import { isHomepage, isClipMode, getTitle } from './utils/env';

function App() {
  useEffect(() => {
    document.title = getTitle();
  }, []);

  if (isHomepage()) {
    return (
      <Routes>
        <Route path="*" element={<HomePage />} />
      </Routes>
    );
  }

  if (isClipMode()) {
    return (
      <Routes>
        <Route path="*" element={<ClipPage />} />
      </Routes>
    );
  }

  return <UserApp />;
}

function UserApp() {
  const location = useLocation();

  const { data: redirectMap = {} } = useQuery({
    queryKey: [QUERY_KEYS.URL_MAP],
    queryFn: fetchUrlMap,
  });

  const redirectUrl = getRedirectUrl(
    redirectMap,
    trimTrailingSlash(location.pathname)
  );

  return (
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
  );
}

export default App;
