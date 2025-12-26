import React from 'react';
import { Link } from 'react-router-dom';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { XIcon, MailIcon } from '../components/icons/FeatureIcons';
import { useAuth } from '../contexts/AuthContext';

const TermsPage: React.FC = () => {
  const { login, isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/favicon.png" alt="glnk" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">glnk.dev</span>
            </Link>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={login}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <GitHubIcon className="w-5 h-5" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6 sm:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: December 25, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using glnk.dev ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="text-gray-600 mb-2">
              glnk.dev is a URL shortening service that allows users to create personalized short links using their own subdomain. The Service includes:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Personal subdomain allocation based on GitHub username</li>
              <li>Creation and management of custom short links</li>
              <li>Instant URL redirection</li>
              <li>Pre-built shortcuts for cloud services (AWS, GCP)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="text-gray-600 mb-2">
              To use the Service, you must authenticate using your GitHub account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Maintaining the security of your GitHub account</li>
              <li>All activities that occur under your subdomain</li>
              <li>Ensuring your links comply with these Terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="text-gray-600 mb-2">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Create links to illegal, harmful, or malicious content</li>
              <li>Distribute malware, phishing attempts, or scams</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm others</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Create misleading or deceptive redirects</li>
              <li>Use automated tools to create excessive links</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Prohibited Content</h2>
            <p className="text-gray-600 mb-2">Links pointing to the following are strictly prohibited:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Adult or sexually explicit content</li>
              <li>Violence or hate speech</li>
              <li>Illegal drugs or controlled substances</li>
              <li>Weapons or dangerous materials</li>
              <li>Gambling (where prohibited by law)</li>
              <li>Fraudulent or deceptive schemes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Service Availability</h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or due to circumstances beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service, including its design, code, and branding, is owned by glnk.dev. You retain ownership of the content you link to. By using the Service, you grant us a license to process your links for redirection purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these Terms. You may also delete your account at any time. Upon termination, your subdomain and links will be deactivated.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed uppercase text-sm">
              The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the Service will be error-free, secure, or continuously available.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed uppercase text-sm">
              To the maximum extent permitted by law, glnk.dev shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold harmless glnk.dev from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Modifications</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will notify users of significant changes via email or service announcement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, please contact us at{' '}
              <a href="mailto:support@glnk.dev" className="text-orange-600 hover:underline">support@glnk.dev</a>.
            </p>
          </section>
        </article>
      </main>

      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500">
                <img src="/favicon.png" alt="glnk" className="w-5 h-5 opacity-50" />
                <span className="text-sm">© 2026 glnk.dev</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
                <a href="mailto:support@glnk.dev" className="hover:text-gray-600 transition-colors">Contact</a>
              </div>
            </div>
            <div className="flex items-center gap-5 text-gray-400">
              <a href="https://github.com/glnk-dev" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" title="GitHub">
                <GitHubIcon className="w-5 h-5" />
              </a>
              <a href="https://x.com/GlnkDev" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors" title="@GlnkDev">
                <XIcon className="w-5 h-5" />
              </a>
              <a href="mailto:support@glnk.dev" className="hover:text-gray-900 transition-colors" title="support@glnk.dev">
                <MailIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
