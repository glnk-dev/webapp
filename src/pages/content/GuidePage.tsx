import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';

const GuidePage: React.FC = () => {
  return (
    <PageLayout>
      <article className="max-w-3xl mx-auto px-6 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Getting Started</h1>
        <p className="text-gray-400 text-sm mb-8">Create your personal short links in under a minute</p>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">1</div>
            <h2 className="text-xl font-semibold text-gray-900">Sign in with GitHub</h2>
          </div>
          <div className="ml-14">
            <p className="text-gray-600 leading-relaxed mb-4">
              Click the "Sign in" button in the top right corner. You'll be redirected to GitHub to authorize glnk.dev.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>Why GitHub?</strong> Your GitHub username becomes your subdomain. If your username is <code className="px-1 py-0.5 bg-white rounded text-orange-600">johndoe</code>, 
                you'll get <code className="px-1 py-0.5 bg-white rounded text-orange-600">johndoe.glnk.dev</code>.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">2</div>
            <h2 className="text-xl font-semibold text-gray-900">Create Your Site</h2>
          </div>
          <div className="ml-14">
            <p className="text-gray-600 leading-relaxed mb-4">
              After signing in, you'll see your subdomain preview. Click "Create my site" to provision your personal domain.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>What happens?</strong> We create a GitHub repository and configure DNS for your subdomain. This usually takes about 30 seconds.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">3</div>
            <h2 className="text-xl font-semibold text-gray-900">Add Your First Link</h2>
          </div>
          <div className="ml-14">
            <p className="text-gray-600 leading-relaxed mb-4">
              Visit your new site (e.g., <code className="px-1.5 py-0.5 bg-gray-100 rounded text-orange-600 text-sm">yourname.glnk.dev</code>) and sign in again to manage your links.
            </p>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 text-gray-500">Path:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-orange-600">/blog</code>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-20 text-gray-500">Redirect to:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">https://medium.com/@yourname</code>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Now <code className="px-1 py-0.5 bg-gray-100 rounded text-orange-600">yourname.glnk.dev/blog</code> redirects to your Medium page!
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-lg">4</div>
            <h2 className="text-xl font-semibold text-gray-900">Share Your Links</h2>
          </div>
          <div className="ml-14">
            <p className="text-gray-600 leading-relaxed mb-4">
              Use your short links anywhere - social bios, email signatures, resumes, business cards, or just type them in your browser.
            </p>
            <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm">
              <div className="space-y-2">
                <p className="text-gray-400"># Quick access from terminal</p>
                <p className="text-gray-300"><span className="text-gray-500">$</span> open <span className="text-orange-400">yourname.glnk.dev/cal</span></p>
                <p className="text-green-400">→ Opening Calendly...</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Popular Link Ideas</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              <code className="text-orange-600">/cal</code>
              <span className="text-gray-500">→ Calendly, Cal.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              <code className="text-orange-600">/cv</code>
              <span className="text-gray-500">→ Resume/CV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              <code className="text-orange-600">/blog</code>
              <span className="text-gray-500">→ Personal blog</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              <code className="text-orange-600">/linkedin</code>
              <span className="text-gray-500">→ LinkedIn profile</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              <code className="text-orange-600">/twitter</code>
              <span className="text-gray-500">→ Twitter/X profile</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-500">•</span>
              <code className="text-orange-600">/github</code>
              <span className="text-gray-500">→ GitHub profile</span>
            </div>
          </div>
        </section>

        <section className="mt-10 text-center">
          <p className="text-gray-600 mb-4">Ready to get started?</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Create your glnk.dev
          </Link>
        </section>
      </article>
    </PageLayout>
  );
};

export default GuidePage;



