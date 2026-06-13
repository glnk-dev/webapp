import React, { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { confirmTotp, disableTotp, getTotpStatus, setupTotp } from '../lib/firebase';

interface TotpSetupModalProps {
  username: string;
  onClose: () => void;
}

interface Pending {
  uri: string;
  recoveryCodes: string[];
}

export const TotpSetupModal: React.FC<TotpSetupModalProps> = ({ username, onClose }) => {
  const [pending, setPending] = useState<Pending | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getTotpStatus) return;
    getTotpStatus({ username }).then(({ data }) => setEnrolled(data.enabled)).catch(() => {});
  }, [username]);

  const handleStartSetup = useCallback(async () => {
    if (!setupTotp) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await setupTotp({ username });
      setPending({ uri: data.uri, recoveryCodes: data.recovery_codes });
    } catch {
      setError('Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const handleConfirm = useCallback(async () => {
    if (!confirmTotp || !code.trim()) return;
    if (enrolled && !window.confirm('Confirming will invalidate your current authenticator and recovery codes. Continue?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await confirmTotp({ username, code: code.trim() });
      setEnrolled(true);
      setPending(null);
      setCode('');
    } catch {
      setError('Invalid code. Make sure you scanned the QR and used the latest code.');
    } finally {
      setIsLoading(false);
    }
  }, [username, code, enrolled]);

  const handleDisable = useCallback(async () => {
    if (!disableTotp) return;
    if (!window.confirm('Disable two-factor authentication?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await disableTotp({ username });
      setPending(null);
      setEnrolled(false);
      setCode('');
    } catch {
      setError('Failed to disable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Two-factor authentication</h2>
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
          Set up an authenticator app to edit without signing in to GitHub each time.
        </p>

        {enrolled && !pending && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="font-medium text-green-900">Authenticator is enrolled.</p>
          </div>
        )}

        {!pending ? (
          <button
            type="button"
            onClick={handleStartSetup}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
          >
            {isLoading ? 'Loading...' : enrolled ? 'Re-enroll authenticator' : 'Set up authenticator'}
          </button>
        ) : (
          <div className="space-y-5">
            <div className="p-5 bg-white border border-gray-200 rounded-xl">
              <p className="text-sm font-medium text-gray-900 mb-3">1. Scan QR with your app</p>
              <div className="flex justify-center mb-3">
                <QRCodeSVG value={pending.uri} size={180} />
              </div>
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer">Can't scan? Enter manually</summary>
                <code className="block mt-2 p-2 bg-gray-50 rounded break-all">{pending.uri}</code>
              </details>
            </div>

            <div className="p-5 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-sm font-medium text-orange-900 mb-2">2. Save these recovery codes</p>
              <p className="text-xs text-orange-700 mb-3">Used to regain access if you lose your phone. Each works once.</p>
              <ul className="grid grid-cols-2 gap-1 font-mono text-sm text-orange-900">
                {pending.recoveryCodes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div>
              <label htmlFor="totp-code" className="block text-sm font-medium text-gray-900 mb-2">
                3. Enter the 6-digit code from your app
              </label>
              <input
                id="totp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-center text-lg tracking-widest focus:border-gray-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading || !code.trim()}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors"
            >
              {isLoading ? 'Confirming...' : 'Confirm enrollment'}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleDisable}
          disabled={isLoading}
          className="mt-8 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Disable authenticator
        </button>
      </div>
    </div>
  );
};
