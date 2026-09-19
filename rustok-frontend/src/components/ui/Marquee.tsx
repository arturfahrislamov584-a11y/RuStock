import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  gap?: string;
}

export default function Marquee({
  children,
  speed = 30,
  reverse = false,
  pauseOnHover = true,
  className = '',
  gap = '2rem',
}: Props) {
  return (
    <div className={`marquee-container ${reverse ? 'marquee-reverse' : ''} ${className}`}>
      <div
        className="marquee-track"
        style={{
          animationDuration: `${speed}s`,
          gap,
          ...(pauseOnHover ? {} : {}),
        }}
      >
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
      </div>
    </div>
  );
}

interface MarqueeItemProps {
  children: ReactNode;
  className?: string;
}

export function MarqueeItem({ children, className = '' }: MarqueeItemProps) {
  return (
    <div className={`flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}
