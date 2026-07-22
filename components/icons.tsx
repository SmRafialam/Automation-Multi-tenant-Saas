import * as React from "react";

type P = React.SVGProps<SVGSVGElement>;

const stroke = (d: React.ReactNode) => (props: P) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {d}
  </svg>
);

export const IconBolt = (props: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export const IconGrid = stroke(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>,
);
export const IconMegaphone = stroke(
  <>
    <path d="M4 4h16v12H7l-3 3V4Z" />
    <path d="M8 9h8M8 12h5" />
  </>,
);
export const IconBag = stroke(
  <>
    <path d="M6 2 4 6v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4H6Z" />
    <path d="M4 6h16M9 10a3 3 0 0 0 6 0" />
  </>,
);
export const IconLink = stroke(
  <>
    <path d="M9 12a3 3 0 0 0 3 3l3-3a3 3 0 0 0-4.2-4.2L11 9" />
    <path d="M15 12a3 3 0 0 0-3-3l-3 3a3 3 0 0 0 4.2 4.2L13 15" />
  </>,
);
export const IconWhatsapp = stroke(
  <path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.1-5.3A8.5 8.5 0 1 1 21 11.5Z" />,
);
export const IconChart = stroke(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />);
export const IconBell = stroke(
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
);
export const IconHelp = stroke(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 2.5M12 17h.01" />
  </>,
);
export const IconSearch = stroke(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>,
);
export const IconPlus = stroke(<path d="M12 5v14M5 12h14" />);
export const IconSend = stroke(<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />);
export const IconSparkle = stroke(
  <path d="M12 3 13.9 8.6 20 9.3l-4.5 4 1.3 6-4.8-3.2L7.2 19.3l1.3-6L4 9.3l6.1-.7L12 3Z" />,
);
export const IconTrash = stroke(
  <path d="M3 6h18M8 6V4h8v2m-9 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6" />,
);
export const IconPlay = stroke(<path d="m5 3 14 9-14 9V3Z" />);
export const IconPin = stroke(
  <>
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8Z" />
  </>,
);
export const IconTruck = stroke(
  <>
    <path d="M1 3h13v13H1zM14 8h5l3 3v5h-8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </>,
);
export const IconCheck = stroke(<path d="M20 6 9 17l-5-5" />);
export const IconClose = stroke(<path d="M18 6 6 18M6 6l12 12" />);
export const IconImage = stroke(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-5-5L5 21" />
  </>,
);
export const IconVideo = stroke(
  <>
    <rect x="2" y="5" width="14" height="14" rx="2" />
    <path d="m16 9 6-3v12l-6-3" />
  </>,
);
export const IconLayers = stroke(
  <>
    <rect x="7" y="3" width="14" height="14" rx="2" />
    <path d="M3 7v12a2 2 0 0 0 2 2h12" />
  </>,
);
export const IconUpload = stroke(
  <>
    <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </>,
);
export const IconMail = stroke(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>,
);
export const IconLock = stroke(
  <>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </>,
);
export const IconBuilding = stroke(
  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />,
);
export const IconUser = stroke(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>,
);
export const IconClock = stroke(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);
export const IconTaka = stroke(<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />);
export const IconTrendUp = stroke(<path d="M7 17 17 7M9 7h8v8" />);
export const IconMenu = stroke(<path d="M4 6h16M4 12h16M4 18h16" />);
export const IconSheet = stroke(
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </>,
);
export const IconFacebook = stroke(
  <path d="M17 2h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
);

export const MEDIA_ICON = {
  image: IconImage,
  video: IconPlay,
  multi: IconLayers,
} as const;
