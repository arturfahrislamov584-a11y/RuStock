import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function StaggerChildren({ children, className = '' }: Props) {
  return (
    <div className={`stagger-children ${className}`}>
      {children}
    </div>
  );
}
