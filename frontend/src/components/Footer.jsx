import { Github, Globe, Linkedin } from "lucide-react";

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/anveekshmrao/", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/anveeksh", icon: Github },
  { label: "Portfolio", href: "https://anveekshmrao.com", icon: Globe },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[linear-gradient(90deg,rgba(7,17,31,0.94),rgba(15,23,42,0.96),rgba(7,17,31,0.94))] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent" />
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-4 py-1 sm:px-6 md:flex md:h-14 md:gap-4 md:py-0 lg:px-8">
        <div className="flex min-w-0 shrink items-center gap-2 text-xs text-slate-300 sm:text-sm">
          <span className="font-semibold text-white">SafeGuard AI</span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex min-w-0 items-center gap-1.5 text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 footer-pulse" />
            <span className="truncate">Research Prototype Active</span>
          </span>
        </div>

        <p className="col-span-2 row-start-2 truncate text-center text-[10px] leading-4 text-slate-400 sm:text-[11px] md:col-auto md:row-auto md:flex-1 md:text-xs">
          Built by Anveeksh Mahesh Rao — MS Cybersecurity, Northeastern University
        </p>

        <div className="flex shrink-0 items-center justify-end gap-1.5">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                title={link.label}
                aria-label={link.label}
                className="group inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-blue-500/15 hover:text-white hover:shadow-[0_0_16px_rgba(59,130,246,0.18)]"
              >
                <Icon size={15} aria-hidden="true" className="transition duration-200 group-hover:-translate-y-0.5" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
