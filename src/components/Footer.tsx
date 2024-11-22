import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-footer-bg text-white py-4 px-6 shadow-lg">
      <div className="relative overflow-hidden">
        {/* Sliding Text */}
        <div className="animate-slide-horizontal whitespace-nowrap text-lg font-bold tracking-wide relative">
          🌟 <span className="text-yellow-300">Claim Your Unique Domain Today!</span>{" "}
          👉 Start now and transform long URLs into sleek, memorable links. Don’t
          miss out —{" "}
          <a
            href="https://glnk.dev/register"
            className="text-yellow-300 hover:underline mx-1"
          >
            register here
          </a>{" "}
          and elevate your link game! 🚀
        </div>

        {/* Sparkle Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full animate-sparkle`}
              style={{
                backgroundColor: i % 2 === 0 ? "#ffd700" : "#ff007f", // Gold and Pink sparkles
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
