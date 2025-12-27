import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const DocsPage: React.FC = () => {
  return (
    <PageLayout>
      <article className="max-w-3xl mx-auto px-6 sm:px-8 overflow-x-hidden">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documentation</h1>
        <p className="text-gray-400 text-sm mb-8">Everything you need to know about glnk.dev</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What is glnk.dev?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            glnk.dev is a personal short link service for developers. You get your own subdomain 
            based on your GitHub username (e.g., <code className="px-1.5 py-0.5 bg-gray-100 rounded text-orange-600 text-sm">yourname.glnk.dev</code>) 
            and can create memorable short links that redirect anywhere.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Think of it as your personal go-links - shortcuts you can type in any browser to quickly access your favorite URLs.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">1</div>
              <div>
                <h3 className="font-medium text-gray-900">Sign in with GitHub</h3>
                <p className="text-gray-600 text-sm">Your GitHub username becomes your subdomain automatically.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">2</div>
              <div>
                <h3 className="font-medium text-gray-900">Create your site</h3>
                <p className="text-gray-600 text-sm">Click "Create my site" and we'll set up your subdomain in seconds.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">3</div>
              <div>
                <h3 className="font-medium text-gray-900">Add your links</h3>
                <p className="text-gray-600 text-sm">Use the web interface to add, edit, or remove your short links.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold">4</div>
              <div>
                <h3 className="font-medium text-gray-900">Share anywhere</h3>
                <p className="text-gray-600 text-sm">Your links work instantly in any browser on any device.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Link Format</h2>
          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-orange-600">you.glnk.dev/blog</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600 break-all">yourblog.com</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-orange-600">you.glnk.dev/cv</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600 break-all">resume.io/you</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-orange-600">you.glnk.dev/cal</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600 break-all">calendly.com/you</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cloud Console Shortcuts</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Pre-built shortcuts for AWS and GCP consoles:
          </p>
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6 font-mono text-xs sm:text-sm overflow-x-auto">
            <div className="space-y-2 text-gray-300">
              <div><span className="text-orange-400">aws.glnk.dev/s3</span> <span className="text-gray-500">→ S3</span></div>
              <div><span className="text-orange-400">aws.glnk.dev/ec2</span> <span className="text-gray-500">→ EC2</span></div>
              <div><span className="text-orange-400">aws.glnk.dev/lambda</span> <span className="text-gray-500">→ Lambda</span></div>
              <div><span className="text-orange-400">gcp.glnk.dev/gke</span> <span className="text-gray-500">→ GKE</span></div>
              <div><span className="text-orange-400">gcp.glnk.dev/bq</span> <span className="text-gray-500">→ BigQuery</span></div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Details</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>Hosting:</strong> GitHub Pages with custom domains</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>DNS:</strong> Cloudflare for fast global resolution</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>Auth:</strong> GitHub OAuth (secure, no passwords)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span><strong>SSL:</strong> HTTPS enabled on all subdomains</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 leading-relaxed">
            Check out the <Link to="/guide" className="text-orange-600 hover:underline">Getting Started Guide</Link> or 
            read our <Link to="/faq" className="text-orange-600 hover:underline">FAQ</Link>. 
            Still stuck? Email us at <a href="mailto:support@glnk.dev" className="text-orange-600 hover:underline">support@glnk.dev</a>.
          </p>
        </section>
      </article>
    </PageLayout>
  );
};

export default DocsPage;
