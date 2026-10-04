"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const LAST_VIEW_AT_KEY = "lastViewAt";
const VIEW_THROTTLE_MS = 30 * 60 * 1000;
const visitFormatter = new Intl.NumberFormat("es-AR");

type ViewResponse = {
  views: number;
};

type ViewCounterProps = {
  countVisit?: boolean;
  className?: string;
};

async function loadViews(readOnly: boolean) {
  const response = await fetch(readOnly ? "/api/views?read=1" : "/api/views", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el contador de visitas.");
  }

  return (await response.json()) as ViewResponse;
}

export function ViewCounter({
  countVisit = false,
  className = "font-mono text-sm tracking-wide text-slate-500",
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const countVisitOnLoad = useRef(countVisit);
  const displayedViews = useMotionValue(0);
  const formattedViews = useTransform(displayedViews, (value) =>
    visitFormatter.format(Math.round(value)),
  );

  useEffect(() => {
    let isActive = true;
    const lastViewAt = Number(window.localStorage.getItem(LAST_VIEW_AT_KEY));
    const shouldCount =
      countVisitOnLoad.current &&
      (!Number.isFinite(lastViewAt) ||
        Date.now() - lastViewAt > VIEW_THROTTLE_MS);

    void loadViews(!shouldCount)
      .then(({ views: nextViews }) => {
        if (!isActive) return;

        if (shouldCount) {
          window.localStorage.setItem(LAST_VIEW_AT_KEY, String(Date.now()));
        }
        setViews(nextViews);
      })
      .catch(() => {
        // El Home sigue siendo usable aunque Redis no esté configurado todavía.
        if (isActive) setHasLoadFailed(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (views === null) return;

    const controls = animate(displayedViews, views, {
      duration: 0.65,
      ease: "easeOut",
    });

    return () => controls.stop();
  }, [displayedViews, views]);

  return (
    <p
      className={className}
      aria-live="polite"
      aria-label={
        hasLoadFailed
          ? "Contador de visitas no disponible"
          : views === null
            ? "Cargando visitas"
            : `${views} visitas`
      }
    >
      {hasLoadFailed ? (
        "— visitas"
      ) : views === null ? (
        "Cargando visitas…"
      ) : (
        <>
          <motion.span>{formattedViews}</motion.span> visitas
        </>
      )}
    </p>
  );
}
