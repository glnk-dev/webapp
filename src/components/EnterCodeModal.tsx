import React, { useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface EnterCodeModalProps {
  onClose: () => void;
}

export const EnterCodeModal: React.FC<EnterCodeModalProps> = ({ onClose }) => {
  const { loginWithTotp } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginWithTotp(code.trim());
      onClose();
    } catch {
      setError('Invalid code. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, [code, loginWithTotp, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Enter code</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Use a 6-digit code from your authenticator app or one of your recovery codes.
        </p>

        <input
          type="text"
          inputMode="text"
          autoComplete="one-time-code"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="000000"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-center text-lg tracking-widest focus:border-gray-400 focus:outline-none mb-4"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !code.trim()}
          className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
        >
          {isLoading ? 'Verifying...' : 'Sign in'}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
