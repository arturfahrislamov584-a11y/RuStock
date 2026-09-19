import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function GlowCard({ children, className = '' }: Props) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/5 to-primary-light/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="relative bento-item">
        {children}
      </div>
    </div>
  );
}
