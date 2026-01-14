
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
        <footer className="border-t border-dark-border py-12 px-6 mt-auto bg-dark-bg relative z-10 w-full text-zinc-400">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-text-secondary">
                        INSTALAÇÃO<span className="text-electric-yellow">SEGURA</span>
                    </span>
                    <span className="text-dark-border">|</span>
                    <span className="text-xs text-text-secondary">© 2026</span>
                </div>

                <div className="flex gap-6 text-sm text-text-secondary">
                    <span
                        className="cursor-pointer hover:text-white transition-colors"
                        onClick={() => { navigate('/privacy-policy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                        Termos e Privacidade
                    </span>
                    <span
                        className="cursor-pointer hover:text-white transition-colors"
                        onClick={() => { navigate('/contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                        Contato
                    </span>
                </div>
            </div>
        </footer>
    );
};
