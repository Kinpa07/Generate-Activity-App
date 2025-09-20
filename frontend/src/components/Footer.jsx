import { Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-hover)] text-white">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Connect with me */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-heading font-semibold mb-2">Connect with me</h3>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/%D0%B2%D0%B5%D1%81%D0%B5%D0%BB%D0%B8%D0%BD-%D0%B8%D0%BB%D0%B8%D0%B5%D0%B2-17806923b/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/40 bg-transparent hover:border-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition transform hover:scale-110"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://github.com/Kinpa07"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/40 bg-transparent hover:border-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] transition transform hover:scale-110"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Right: About Pickly */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-heading font-semibold mb-2">About Pickly</h3>
            <ul className="space-y-1 text-white/90 text-base">
              <li>AI-powered activity ideas</li>
              <li>MERN stack with JWT auth</li>
              <li>Filter by price, type & group size</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
