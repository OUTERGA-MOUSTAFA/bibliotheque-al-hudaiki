'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

const reduceMotionQuery = '(prefers-reduced-motion: reduce)';
const subscribeReduceMotion = (cb: () => void) => {
  const mq = window.matchMedia(reduceMotionQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

// Index courant d'un diaporama, défilement automatique, pause (bouton, survol, focus clavier).
// Les visiteurs qui demandent moins d'animations (réglage du système) démarrent en pause.
export function useAutoplay(total: number, secondes: number) {
  const [index, setIndex] = useState(0);
  const [pauseUtilisateur, setPauseUtilisateur] = useState<boolean | null>(null);
  const [survol, setSurvol] = useState(false);
  const reduceMotion = useSyncExternalStore(
    subscribeReduceMotion,
    () => window.matchMedia(reduceMotionQuery).matches,
    () => false,
  );

  const enPause = pauseUtilisateur ?? reduceMotion;
  const actif = total > 1 && !enPause && !survol;

  const aller = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);
  const suivant = useCallback(() => aller(index + 1), [aller, index]);
  const precedent = useCallback(() => aller(index - 1), [aller, index]);

  useEffect(() => {
    if (!actif) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % total), secondes * 1000);
    return () => window.clearTimeout(id);
  }, [actif, index, total, secondes]);

  return {
    index: total ? Math.min(index, total - 1) : 0,
    aller,
    suivant,
    precedent,
    enPause,
    actif,
    basculerPause: () => setPauseUtilisateur(!enPause),
    // À poser sur le conteneur : pause au survol de la souris et quand le clavier est dedans
    survolProps: {
      onMouseEnter: () => setSurvol(true),
      onMouseLeave: () => setSurvol(false),
      onFocus: () => setSurvol(true),
      onBlur: (e: React.FocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setSurvol(false);
      },
    },
  };
}
