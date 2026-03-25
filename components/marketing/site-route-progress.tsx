"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 180;
const FINISH_MS = 240;
const SAFETY_TIMEOUT_MS = 8000;

type ProgressPhase = "idle" | "loading" | "finishing";

function isPrimaryNavigationClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function isEligibleInternalUrl(url: URL) {
  return url.origin === window.location.origin && !url.pathname.startsWith("/api");
}

export function SiteRouteProgress() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const [phase, setPhase] = useState<ProgressPhase>("idle");
  const phaseRef = useRef<ProgressPhase>("idle");
  const hasMountedRef = useRef(false);
  const routeKeyRef = useRef(routeKey);
  const startedAtRef = useRef(0);
  const finishTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const setPhaseSafe = useCallback((nextPhase: ProgressPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const finishProgress = useCallback(() => {
    if (phaseRef.current === "idle") {
      return;
    }

    const elapsed = performance.now() - startedAtRef.current;
    const delay = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearTimers();

    finishTimerRef.current = window.setTimeout(() => {
      setPhaseSafe("finishing");

      resetTimerRef.current = window.setTimeout(() => {
        setPhaseSafe("idle");
      }, FINISH_MS);
    }, delay);
  }, [clearTimers, setPhaseSafe]);

  const startProgress = useCallback(() => {
    clearTimers();
    startedAtRef.current = performance.now();
    setPhaseSafe("loading");

    safetyTimerRef.current = window.setTimeout(() => {
      finishProgress();
    }, SAFETY_TIMEOUT_MS);
  }, [clearTimers, finishProgress, setPhaseSafe]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      routeKeyRef.current = routeKey;
      return;
    }

    if (routeKeyRef.current === routeKey) {
      return;
    }

    routeKeyRef.current = routeKey;
    finishProgress();
  }, [finishProgress, routeKey]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || !isPrimaryNavigationClick(event)) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) {
        return;
      }

      if (anchor.dataset.routeProgress === "ignore") {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      if (!isEligibleInternalUrl(nextUrl)) {
        return;
      }

      const samePathAndSearch =
        nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search;

      if (samePathAndSearch) {
        return;
      }

      startProgress();
    };

    const onSubmitCapture = (event: SubmitEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLFormElement)) {
        return;
      }

      if (target.dataset.routeProgress !== "search") {
        return;
      }

      const method = (target.getAttribute("method") ?? "get").toLowerCase();
      if (method !== "get") {
        return;
      }

      if (target.target && target.target !== "_self") {
        return;
      }

      const action = new URL(target.getAttribute("action") || window.location.href, window.location.href);
      if (!isEligibleInternalUrl(action)) {
        return;
      }

      event.preventDefault();

      const formData =
        event.submitter instanceof HTMLButtonElement || event.submitter instanceof HTMLInputElement
          ? new FormData(target, event.submitter)
          : new FormData(target);

      const nextUrl = new URL(action.toString());
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        if (typeof value !== "string") {
          continue;
        }

        const normalized = value.trim();
        if (!normalized) {
          continue;
        }

        params.append(key, normalized);
      }

      nextUrl.search = params.toString();

      if (nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search) {
        return;
      }

      startProgress();
      router.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    };

    const onPopState = () => {
      startProgress();
    };

    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("submit", onSubmitCapture, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClickCapture, true);
      document.removeEventListener("submit", onSubmitCapture, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
  }, [clearTimers, router, startProgress]);

  return (
    <div
      className={`site-route-progress ${
        phase === "idle" ? "" : "is-visible"
      } ${phase === "loading" ? "is-loading" : ""} ${
        phase === "finishing" ? "is-finishing" : ""
      }`}
      aria-hidden="true"
    >
      <div className="site-route-progress-track" />
      <div className="site-route-progress-bar">
        <span className="site-route-progress-glow" />
      </div>
    </div>
  );
}
