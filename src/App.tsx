import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import RedirectComponent from './components/RedirectComponent';
import ScrollToTop from './components/ScrollToTop';
import './App.css';
import TablePage from './pages/TablePage';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import DocsPage from './pages/content/DocsPage';
import GuidePage from './pages/content/GuidePage';
import FaqPage from './pages/content/FaqPage';
import { getRedirectUrl, trimTrailingSlash } from './utils/url';
import { useQuery } from '@tanstack/react-query';
import { fetchUrlMap } from './api';
import { QUERY_KEYS } from './constants';
import { isHomepage, getGlnkUsername } from './utils/env';

function App() {
  useEffect(() => {
    const title = isHomepage()
      ? 'glnk.dev · Short Links, Your Way'
      : `${getGlnkUsername()}.glnk.dev · Short Links, Your Way`;
    document.title = title;
  }, []);

  if (isHomepage()) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </>
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
