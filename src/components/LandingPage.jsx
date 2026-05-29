import React, { useEffect, useState } from 'react';

const LandingPage = ({ onLoginClick, onSignupClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary/30 min-h-screen w-full overflow-x-hidden scroll-smooth">
      {/* TopNavBar */}
      <nav className={`w-full fixed top-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-md ${isScrolled ? 'shadow-md border-b border-outline-variant/10' : ''}`}>
        <div className="flex justify-between items-center px-margin-mobile md:px-10 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-stack-lg">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-headline-md text-headline-md text-primary tracking-tight font-bold hover:text-secondary transition-colors cursor-pointer">FlowSync</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="hidden md:block font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-all active:scale-95 cursor-pointer font-semibold"
            >
              Login
            </button>
            <button
              onClick={onSignupClick}
              className="bg-secondary text-on-secondary px-6 py-2.5 rounded-full font-label-md text-label-md transition-all active:scale-95 shadow-[0_2px_0_rgba(0,0,0,0.1)] hover:bg-on-secondary-fixed-variant cursor-pointer font-semibold"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-gradient pt-48 pb-16 overflow-hidden bg-gradient-to-b from-[#e5eeff] to-[#f8f9ff]">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-10 text-center">
          <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-1.5 rounded-full mb-stack-lg animate-pulse bg-[#e5eeff] border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">New: AI Workflow Automations</span>
          </div>

          <h1 className="font-headline-lg text-[48px] md:text-[72px] leading-[1.1] text-primary mb-stack-md max-w-4xl mx-auto font-bold tracking-tight">
            Sync Your Flow. <span className="text-secondary">Accelerate Your Team.</span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-2xl mx-auto leading-relaxed">
            The collaborative project management tool built for high-performance teams. Manage tasks, communicate in real-time, and ship faster.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
            <button
              onClick={onSignupClick}
              className="bg-secondary text-on-secondary px-10 py-4 rounded-xl font-label-md text-label-md text-lg transition-all active:scale-95 shadow-[0_4px_12px_rgba(49,107,243,0.3)] hover:brightness-110 cursor-pointer font-bold"
            >
              Get Started for Free
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="bg-surface-container-lowest border border-outline-variant text-on-surface px-10 py-4 rounded-xl font-label-md text-label-md text-lg transition-all active:scale-95 hover:bg-surface-container-low cursor-pointer font-semibold"
            >
              Book a Demo
            </button>
          </div>

        </div>
      </header>

      {/* Value Propositions (Bento Grid) */}
      <section id="features" className="pt-12 pb-24 bg-white border-b border-outline-variant/10">
        <div className="px-margin-mobile md:px-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm font-bold">The Foundation of Fast Teams</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Everything you need to maintain momentum without the clutter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
            {/* Prop 1: Kanban */}
            <div className="md:col-span-8 bg-surface-container-low rounded-[24px] p-10 flex flex-col justify-between overflow-hidden relative group border border-outline-variant/10 min-h-[360px]">
              <div className="max-w-md">
                <i className="fa-solid fa-table-columns text-secondary text-3xl mb-stack-md"></i>
                <h3 className="font-headline-md text-headline-md text-primary mb-stack-sm font-bold">Intuitive Kanban Boards</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Visualize progress with ease. Drag-and-drop tasks through custom pipelines designed for your specific team workflow.</p>
              </div>

              <div className="mt-stack-lg translate-y-8 group-hover:translate-y-4 transition-transform duration-500 flex gap-4">
                <div className="w-48 h-56 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-3">
                  <div className="h-2 w-12 bg-secondary/20 rounded"></div>
                  <div className="h-4 w-full bg-surface-container-low rounded"></div>
                  <div className="h-4 w-3/4 bg-surface-container-low rounded"></div>
                  <div className="mt-auto flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-green-400 border-2 border-white"></div>
                  </div>
                </div>
                <div className="w-48 h-56 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-3">
                  <div className="h-2 w-12 bg-error/20 rounded"></div>
                  <div className="h-4 w-full bg-surface-container-low rounded"></div>
                  <div className="mt-auto flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-purple-400 border-2 border-white"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prop 2: Context */}
            <div className="md:col-span-4 bg-primary-container text-white rounded-[24px] p-10 flex flex-col justify-between overflow-hidden group min-h-[360px]">
              <div>
                <i className="fa-solid fa-file-lines text-secondary text-3xl mb-stack-md"></i>
                <h3 className="font-headline-md text-headline-md mb-stack-sm font-bold">Deep Task Context</h3>
                <p className="font-body-md text-body-md text-on-primary-container leading-relaxed">Keep comments and files in one place. No more hunting through email threads for that one crucial attachment.</p>
              </div>

              <div className="relative mt-stack-lg h-28">
                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-primary-container to-transparent z-10"></div>
                <div className="flex flex-col gap-2">
                  <div className="bg-white/10 p-3 rounded-lg flex items-center gap-2">
                    <i className="fa-solid fa-paperclip text-sm"></i>
                    <span className="text-xs">v2-design-spec.pdf</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg flex items-center gap-2">
                    <i className="fa-solid fa-comment text-sm"></i>
                    <span className="text-xs">Sarah: Needs review...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prop 3: Real-time */}
            <div className="md:col-span-12 bg-secondary-container text-white rounded-[24px] p-10 flex flex-col md:flex-row items-center justify-between gap-10 border border-outline-variant/10">
              <div className="md:max-w-lg">
                <i className="fa-solid fa-rotate text-3xl mb-stack-md"></i>
                <h3 className="font-headline-md text-headline-md mb-stack-sm font-bold">Real-time Collaboration</h3>
                <p className="font-body-lg text-body-lg opacity-90 leading-relaxed">Stay synced with your team instantly. Witness live edits, instant status updates, and zero-latency communication that feels like you're in the same room.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative font-sans">
                  <img
                    className="w-16 h-16 rounded-full border-4 border-white object-cover"
                    alt="Close-up portrait of a professional man in a modern office, part of a diverse team. The photography is clean with a soft-focus background, consistent with a corporate modern light-mode design. His expression is focused yet friendly, representing high-performance collaboration. The lighting is warm and natural."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBNfnTQN80cCZ2HmFFLLQ9zuxMalaA6WAuE79-AHlgtAJS6DnGuQ0u5likctlPOsTC502si3GeHbNY5ChUYEaaCI1LMlmwTCCwR3elA9uENybp_uKDvA_nTvTnRRX1IbaDhj0_ltzdcy0bguOToc3eMPzg5uN71v-5lKuUN1wRE3INeT2IbvbHd4vunWaXP0Dm0gUXKHah9iM5cKFl-GDeZPjW43tbqNTYV33BdhPDqU1IXkvC7AhwoIxbXSOkjc4gwpvVqlSaV16e"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div className="relative font-sans">
                  <img
                    className="w-16 h-16 rounded-full border-4 border-white object-cover"
                    alt="Close-up portrait of a professional woman, part of a creative high-performance team. The visual style is crisp and modern with a focus on human-centric interaction. The lighting is high-key and bright, fitting a minimalist professional UI theme. She looks confident and engaged."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCXqSYlvkjRWopNQXGY1i3qpKJ5I5RICb2j4kXhxlD8hNJVvvq5mX4A5kF4YdsY-DTYujeuWfu__CFBRMsSWGQnhFQpT2O_HRx_JYf2YlZ3qTpUSsPmyKn1I9fkW4uQb8mo3bBOWC8n_n9mL90MeY5vJFmGc7rySyVaU3UZq31mksrXP4d1TuY6mCJRnkq7-QbKDHL3EFcbGAEwMyVE63SKpivSgEnxHHyp-nSjXqJRCmAdfnReZK5Xv0FIFdS8uiYXzf2akC4ERG7"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center font-bold">
                  +12
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface-container-lowest border-y border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">
            <div className="p-8 rounded-2xl hover:bg-background transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-stack-md group-hover:bg-secondary group-hover:text-white transition-colors">
                <i className="fa-solid fa-chart-line text-lg"></i>
              </div>
              <h4 className="font-headline-md text-headline-md mb-stack-sm font-bold text-on-surface">Advanced Reporting</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Gain insights into team velocity and project health with beautiful, automated charts.</p>
            </div>

            <div className="p-8 rounded-2xl hover:bg-background transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-stack-md group-hover:bg-secondary group-hover:text-white transition-colors">
                <i className="fa-solid fa-shield-halved text-lg"></i>
              </div>
              <h4 className="font-headline-md text-headline-md mb-stack-sm font-bold text-on-surface">Enterprise Security</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">SSO, SOC2 compliance, and data encryption at rest and in transit come standard.</p>
            </div>

            <div className="p-8 rounded-2xl hover:bg-background transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-stack-md group-hover:bg-secondary group-hover:text-white transition-colors">
                <i className="fa-solid fa-puzzle-piece text-lg"></i>
              </div>
              <h4 className="font-headline-md text-headline-md mb-stack-sm font-bold text-on-surface">100+ Integrations</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Connect with Slack, GitHub, Figma, and every other tool your team depends on.</p>
            </div>

            <div className="p-8 rounded-2xl hover:bg-background transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-stack-md group-hover:bg-secondary group-hover:text-white transition-colors">
                <i className="fa-solid fa-bell text-lg"></i>
              </div>
              <h4 className="font-headline-md text-headline-md mb-stack-sm font-bold text-on-surface">Smart Notifications</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Custom alerts that cut through the noise and only notify you when it truly matters.</p>
            </div>

            <div className="p-8 rounded-2xl hover:bg-background transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-stack-md group-hover:bg-secondary group-hover:text-white transition-colors">
                <i className="fa-solid fa-clock-rotate-left text-lg"></i>
              </div>
              <h4 className="font-headline-md text-headline-md mb-stack-sm font-bold text-on-surface">Version History</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Full audit logs and versioning for every task description and comment thread.</p>
            </div>

            <div className="p-8 rounded-2xl hover:bg-background transition-colors group cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-stack-md group-hover:bg-secondary group-hover:text-white transition-colors">
                <i className="fa-solid fa-people-group text-lg"></i>
              </div>
              <h4 className="font-headline-md text-headline-md mb-stack-sm font-bold text-on-surface">Shared Portals</h4>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Invite clients to specific boards without compromising your internal team privacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-margin-mobile md:px-10 text-center">
          <div className="bg-primary-container rounded-[32px] py-20 px-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary blur-[120px] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="font-headline-lg text-[40px] leading-tight text-white mb-stack-md font-bold">Ready to transform your workflow?</h2>
              <p className="text-on-primary-container font-body-lg text-lg mb-stack-lg max-w-xl mx-auto leading-relaxed">
                Join 5,000+ teams shipping faster and with less stress today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={onSignupClick}
                  className="bg-secondary text-on-secondary px-10 py-4 rounded-xl font-label-md text-label-md text-lg transition-all active:scale-95 shadow-xl hover:brightness-110 cursor-pointer font-bold"
                >
                  Sign Up Now
                </button>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="bg-transparent border border-outline-variant text-white px-10 py-4 rounded-xl font-label-md text-label-md text-lg transition-all active:scale-95 hover:bg-white/5 cursor-pointer font-semibold"
                >
                  Talk to Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full pt-12 pb-8 bg-surface-container-lowest border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-10 flex flex-col md:flex-row justify-between items-center gap-stack-md">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="font-headline-md text-headline-md text-primary font-bold">FlowSync</span>
            <p className="text-on-surface-variant font-body-md text-body-md text-center md:text-left">© 2026 FlowSync Inc. All rights reserved. Built for high-performance collaboration.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-on-surface-variant">
            <a className="hover:text-secondary transition-colors" href="#privacy">Privacy Policy</a>
            <a className="hover:text-secondary transition-colors" href="#terms">Terms of Service</a>
            <a className="hover:text-secondary transition-colors" href="#security">Security</a>
            <a className="hover:text-secondary transition-colors" href="#status">Status</a>
            <a className="hover:text-secondary transition-colors" href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
