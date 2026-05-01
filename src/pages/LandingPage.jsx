import React, { useEffect } from 'react';
import { 
    Nav, Hero, LogoStrip, Problem, PlatformReveal, Bento, 
    SplitTour, HowItWorks, Integrations, Pricing, Security, FinalCTA, Footer 
} from '../components/landing/LandingCode';

// A custom hook for reveal animations ported from LandingCode.jsx
function useReveal() {
    useEffect(() => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '-5% 0px -10% 0px' });
        document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);
}

export const LandingPage = ({ onLogin }) => {
    useReveal();

    // We can inject our base CSS variables here or they are already in index.css
    return (
        <div className="bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans overflow-x-hidden">
            <Nav onLogin={onLogin} />
            <Hero headline="Gerçek kâr. / Gerçek zamanlı." onLogin={onLogin} />
            <LogoStrip />
            <Problem />
            <PlatformReveal />
            <Bento />
            <SplitTour />
            <HowItWorks />
            <Integrations />
            <Pricing onLogin={onLogin} />
            <Security />
            <FinalCTA onLogin={onLogin} />
            <Footer />
        </div>
    );
};
