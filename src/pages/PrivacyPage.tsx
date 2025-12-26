import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/favicon.png" alt="glnk" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">glnk.dev</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6 sm:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-8">Last updated: December 25, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              glnk.dev ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our URL shortening service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-800 mb-2">Account Information</h3>
            <p className="text-gray-600 mb-2">When you sign up using GitHub authentication, we collect:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Your GitHub username (used as your subdomain)</li>
              <li>Your email address (for account-related communications)</li>
              <li>Your profile picture (for display purposes)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2">Link Data</h3>
            <p className="text-gray-600 mb-2">We store the short links you create, including:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>The short path (e.g., /github, /blog)</li>
              <li>The destination URL</li>
              <li>Creation and modification timestamps</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mb-2">Usage Data</h3>
            <p className="text-gray-600 mb-2">We may collect anonymous usage statistics to improve our service, including:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Number of redirects per link</li>
              <li>Browser and device type (anonymized)</li>
              <li>Geographic region (country-level only)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="text-gray-600 mb-2">We use the collected information to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Provide and maintain the URL shortening service</li>
              <li>Create your personalized subdomain</li>
              <li>Authenticate your account</li>
              <li>Send important service updates</li>
              <li>Improve our service based on usage patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Storage and Security</h2>
            <p className="text-gray-600 leading-relaxed">
              Your data is stored securely using industry-standard practices. We use Firebase and Google Cloud Platform infrastructure, which provides enterprise-grade security including encryption at rest and in transit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
            <p className="text-gray-600 mb-2">We use the following third-party services:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>GitHub</strong> - For authentication</li>
              <li><strong>Google Firebase</strong> - For data storage and hosting</li>
              <li><strong>Cloudflare</strong> - For DNS and CDN services</li>
              <li><strong>Google AdSense</strong> - For displaying advertisements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies and Tracking</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies for authentication and session management. Third-party advertising partners may use cookies to serve personalized ads. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-600 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your link data</li>
              <li>Opt out of non-essential data collection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPage;
