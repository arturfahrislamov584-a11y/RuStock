import { type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  className?: string;
  count?: number;
}

export default function FloatingParticles({ children, className = '', count = 6 }: Props) {
  const particles = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`relative ${className}`}>
      {particles.map((i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary/10 pointer-events-none"
          style={{
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animation: `particle-float ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
      {children}
    </div>
  );
}
