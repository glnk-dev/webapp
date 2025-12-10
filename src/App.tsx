import { Route, Routes, useLocation } from 'react-router-dom';
import RedirectComponent from './components/RedirectComponent';
import './App.css';
import TablePage from './pages/TablePage';
import SignUpPage from './pages/SignUpPage';
import { getRedirectUrl, trimTrailingSlash } from './utils/url';
import { useQuery } from '@tanstack/react-query';
import { fetchUrlMap } from './api';
import { QUERY_KEYS } from './constants';
import { isHomepage } from './utils/env';

function App() {
  if (isHomepage()) {
    return (
      <Routes>
        <Route path="*" element={<SignUpPage />} />
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
