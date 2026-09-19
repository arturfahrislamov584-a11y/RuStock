import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

export default function PageTransition({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.remove('page-enter-active');
    el.classList.add('page-enter');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('page-enter-active');
        el.classList.remove('page-enter');
      });
    });
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-enter-active">
      {children}
    </div>
  );
}
