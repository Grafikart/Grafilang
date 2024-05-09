import { PropsWithChildren } from "react";

type Props = {
  size?: number;
};

/**
 * Icon pack : https://lucide.dev/
 */

export function BookIcon({ size = 24 }: Props) {
  return (
    <SVG size={size}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      <path d="M6 8h2" />
      <path d="M6 12h2" />
      <path d="M16 8h2" />
      <path d="M16 12h2" />
    </SVG>
  );
}

export function ChallengeIcon({ size = 24 }: Props) {
  return (
    <SVG size={size}>
      <path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" />
      <path d="M8 18h1" />
      <path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z" />
    </SVG>
  );
}

export function OutputIcon({ size = 24 }: Props) {
  return (
    <SVG size={size}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </SVG>
  );
}

export function PlayIcon({ size = 24 }: Props) {
  return (
    <SVG size={size}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </SVG>
  );
}

export function SubmitIcon({ size = 24 }: Props) {
  return (
    <SVG size={size}>
      <path d="m16 16 2 2 4-4" />
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
      <path d="m7.5 4.27 9 5.15" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </SVG>
  );
}

function SVG({ size = 24, children }: PropsWithChildren<Props>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
