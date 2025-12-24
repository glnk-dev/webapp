import React, { useState, useCallback } from 'react';
import { GitHubIcon } from '../components/icons/GitHubIcon';
import { ExternalLinkIcon } from '../components/icons/ExternalLinkIcon';
import {
  LinkIcon,
  BoltIcon,
  GlobeIcon,
  PencilSquareIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  XIcon,
  MailIcon,
} from '../components/icons/FeatureIcons';
import { useAuth } from '../contexts/AuthContext';
import { requestSignup } from '../lib/firebase';

const FEATURES = [
  {
    icon: LinkIcon,
    title: 'Personal Go-Links',
    description: 'Get your own subdomain like yourname.glnk.dev with memorable short links.',
  },
  {
    icon: BoltIcon,
    title: 'Instant Redirects',
    description: 'Lightning-fast redirects with zero latency. Type less, get there faster.',
  },
  {
    icon: GlobeIcon,
    title: 'Works Everywhere',
    description: 'No app needed. Just type your short link in any browser on any device.',
  },
  {
    icon: PencilSquareIcon,
    title: 'Easy Management',
    description: 'Add, edit, and manage your links through our simple web interface.',
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile Ready',
    description: 'Access cloud consoles on the go. Perfect for incident response.',
  },
  {
    icon: CloudIcon,
    title: 'Cloud Shortcuts',
    description: 'Pre-built shortcuts for AWS and GCP consoles at aws.glnk.dev and gcp.glnk.dev.',
  },
] as const;

const EXAMPLES = [
  { short: 'aws.glnk.dev/s3', desc: 'S3 Console' },
  { short: 'aws.glnk.dev/ec2', desc: 'EC2 Instances' },
  { short: 'gcp.glnk.dev/gke', desc: 'GKE Clusters' },
] as const;

const STEPS = [
  { step: '1', title: 'Sign in with GitHub', desc: 'Your GitHub username becomes your subdomain' },
  { step: '2', title: 'Add your links', desc: 'Configure your short links through our web interface' },
  { step: '3', title: 'Share anywhere', desc: 'Your links are live instantly and work everywhere' },
] as const;

const CLOUD_EXAMPLES = [
  { code: 'aws.glnk.dev/s3', desc: 'S3 Console' },
  { code: 'aws.glnk.dev/ec2/us-west-2', desc: 'EC2 in us-west-2' },
  { code: 'gcp.glnk.dev/bq/my-project', desc: 'BigQuery for project' },
] as const;

const getDefaultLinks = (username: string) => [
  { subpath: '/github', redirectLink: `https://github.com/${username}` },
  { subpath: '/blog', redirectLink: `https://${username}.github.io` },
];

const HomePage: React.FC = () => {
  const { login, isAuthenticated, user, githubLogin, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [siteExists, setSiteExists] = useState(false);

  const handleGitHubLogin = useCallback(async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  }, [login]);

  const handleSignup = useCallback(async () => {
    if (!githubLogin || !requestSignup) return;

    setIsSubmitting(true);
    try {
      await requestSignup({ username: githubLogin, links: getDefaultLinks(githubLogin) });
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      const isAlreadyExists = error.code?.includes('already-exists') || error.message?.toLowerCase().includes('already exists');
      if (isAlreadyExists) {
        setSiteExists(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [githubLogin]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const siteUrl = githubLogin ? `https://${githubLogin}.glnk.dev` : '#';
  const hasSite = submitted || siteExists;

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="https://glnk.dev" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/favicon.png" alt="glnk" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">glnk.dev</span>
            </a>
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
                onClick={handleGitHubLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <GitHubIcon className="w-5 h-5" />
                <span>{isLoggingIn ? 'Signing in...' : 'Sign in'}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/hero.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Your memorable
              <span className="text-orange-500"> short links</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Get your own <code className="px-2 py-1 bg-gray-100 rounded text-orange-600 font-mono text-lg">yourname.glnk.dev</code> subdomain.
              <br className="hidden sm:block" />
              Create go-links that actually make sense.
            </p>

            {hasSite ? (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-5 bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-lg shadow-orange-500/25"
              >
                <p className="text-sm text-orange-100 mb-1">{submitted ? 'Site created!' : 'Go to your site'}</p>
                <p className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{githubLogin}.glnk.dev</span>
                  <ExternalLinkIcon className="w-5 h-5 opacity-75" />
                </p>
              </a>
            ) : isAuthenticated && githubLogin ? (
              <div className="space-y-4">
                <div className="inline-block px-6 py-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Your subdomain</p>
                  <p className="text-2xl font-bold">
                    <span className="text-gray-900">{githubLogin}</span>
                    <span className="text-gray-400">.glnk.dev</span>
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleSignup}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create my site'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGitHubLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors shadow-lg"
              >
                <GitHubIcon className="w-5 h-5" />
                {isLoggingIn ? 'Signing in...' : 'Get started with GitHub'}
              </button>
            )}

            <p className="mt-4 text-sm text-gray-400">Free forever • No credit card required</p>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {EXAMPLES.map((ex) => (
              <a
                key={ex.short}
                href={`https://${ex.short}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <span className="font-mono text-orange-600">{ex.short}</span>
                <span className="text-gray-400 ml-2">→ {ex.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why glnk.dev?</h2>
            <p className="text-lg text-gray-600">Simple, fast, and memorable short links for developers</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600">Get your own short links in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Cloud console shortcuts</h2>
              <p className="text-gray-400 text-lg mb-6">
                Stop googling for AWS and GCP console URLs. Use our pre-built shortcuts to access any service instantly.
              </p>
              <div className="space-y-3">
                {CLOUD_EXAMPLES.map((ex) => (
                  <div key={ex.code} className="flex items-center gap-4">
                    <code className="px-3 py-1.5 bg-gray-800 rounded font-mono text-orange-400">{ex.code}</code>
                    <span className="text-gray-500">→</span>
                    <span className="text-gray-300">{ex.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4 text-gray-500">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2">Terminal</span>
              </div>
              <div className="space-y-2 text-gray-300">
                <p><span className="text-gray-500">$</span> open <span className="text-orange-400">aws.glnk.dev/lambda</span></p>
                <p className="text-green-400">→ Redirecting to AWS Lambda Console...</p>
                <p className="mt-4"><span className="text-gray-500">$</span> open <span className="text-orange-400">gcp.glnk.dev/gke</span></p>
                <p className="text-green-400">→ Redirecting to GKE Clusters...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to simplify your links?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join developers who are already using glnk.dev to save time.
          </p>
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-500/25"
            >
              Get your glnk.dev now
            </button>
            <a
              href="https://glnk.dev/join"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Want to contribute? Join as a developer →
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <img src="/favicon.png" alt="glnk" className="w-5 h-5 opacity-50" />
              <span className="text-sm">© 2026 glnk.dev</span>
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

export default HomePage;
