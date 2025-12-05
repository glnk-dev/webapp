import React, { useEffect } from 'react';

interface RedirectComponentProps {
  redirectUrl: string;
}

const RedirectComponent: React.FC<RedirectComponentProps> = ({ redirectUrl }) => {
  useEffect(() => {
    window.location.href = redirectUrl;
  }, [redirectUrl]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm text-gray-600 mb-2">Redirecting...</p>
        <p className="text-xs text-gray-500">
          If you are not redirected,{' '}
          <a
            href={redirectUrl}
            className="text-gray-900 hover:text-gray-600 transition-colors underline"
          >
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default RedirectComponent;
