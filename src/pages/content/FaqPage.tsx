import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';

interface FaqItemProps {
  question: string;
  answer: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-orange-600 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <span className={`text-2xl text-gray-400 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ_ITEMS: FaqItemProps[] = [
  {
    question: "What is glnk.dev?",
    answer: "glnk.dev is a personal short link service for developers. You get your own subdomain based on your GitHub username and can create memorable short links that redirect anywhere."
  },
  {
    question: "Is it free?",
    answer: "Yes, glnk.dev is completely free. No credit card required, no hidden fees. We believe every developer should have access to personal short links."
  },
  {
    question: "How do I sign up?",
    answer: (
      <>
        Just click "Sign in with GitHub" on the homepage. Your GitHub username automatically becomes your subdomain. For example, if your username is <code className="px-1 py-0.5 bg-gray-100 rounded text-orange-600">johndoe</code>, you'll get <code className="px-1 py-0.5 bg-gray-100 rounded text-orange-600">johndoe.glnk.dev</code>.
      </>
    )
  },
  {
    question: "Can I change my subdomain?",
    answer: "Your subdomain is tied to your GitHub username, so it cannot be changed directly. However, if you change your GitHub username, please contact us to update your glnk.dev subdomain."
  },
  {
    question: "How many links can I create?",
    answer: "There's no hard limit on the number of links you can create. However, we ask that you use the service responsibly and only create links you'll actually use."
  },
  {
    question: "Are my links private?",
    answer: "By default, your link table is visible to anyone who visits your subdomain, but only you can edit them. If you need private links that only you can see, let us know - we're considering adding this feature."
  },
  {
    question: "What are the cloud console shortcuts?",
    answer: (
      <>
        We provide pre-built shortcuts for AWS and GCP consoles at <code className="px-1 py-0.5 bg-gray-100 rounded text-orange-600">aws.glnk.dev</code> and <code className="px-1 py-0.5 bg-gray-100 rounded text-orange-600">gcp.glnk.dev</code>. For example, <code className="px-1 py-0.5 bg-gray-100 rounded text-orange-600">aws.glnk.dev/s3</code> takes you directly to the S3 console.
      </>
    )
  },
  {
    question: "How fast are the redirects?",
    answer: "Redirects are nearly instant. We use Cloudflare's global CDN and GitHub Pages for hosting, which means your links resolve quickly from anywhere in the world."
  },
  {
    question: "Can I use custom domains?",
    answer: "Currently, all links use the glnk.dev domain. Custom domain support may be added in the future for users who want their own branded short links."
  },
  {
    question: "What happens if I delete my GitHub account?",
    answer: "Your glnk.dev subdomain will continue to work, but you won't be able to edit your links. If you want to delete your glnk.dev account, please contact us at support@glnk.dev."
  },
  {
    question: "Is there an API?",
    answer: "Not yet, but we're considering adding one. For now, all link management is done through the web interface. If you need API access, let us know your use case!"
  },
  {
    question: "How do I report abuse?",
    answer: (
      <>
        If you see a glnk.dev link being used for spam, phishing, or other malicious purposes, please report it to <a href="mailto:support@glnk.dev" className="text-orange-600 hover:underline">support@glnk.dev</a>. We take abuse seriously and will investigate promptly.
      </>
    )
  },
];

const FaqPage: React.FC = () => {
  return (
    <PageLayout>
      <article className="max-w-3xl mx-auto px-6 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-400 text-sm mb-8">Everything you might want to know</p>

        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>

        <section className="mt-12 bg-gray-50 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? We're here to help.
          </p>
          <a 
            href="mailto:support@glnk.dev"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            Contact Support
          </a>
        </section>
      </article>
    </PageLayout>
  );
};

export default FaqPage;
