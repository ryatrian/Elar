import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const ClipboardIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.042m-7.332 0c-.055.194-.084.4-.084.612v3.042m0 9.75H9.75a2.25 2.25 0 01-2.25-2.25V9h10.5v12c0 1.242-.99 2.25-2.25 2.25H9.75z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export const ResetIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183a8.25 8.25 0 00-11.664 0l3.181 3.183" />
    </svg>
);

export const UploadCloudIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = (props) => (
    <svg fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.2-26.7l-7-4.1-72.5 19 19.3-70.6-4.5-7.4c-18.4-30.6-28-66.5-28-104.3 0-108.6 88.4-197 197-197s197 88.4 197 197-88.4 197-197 197zm101.9-138.4c-13.6-6.7-80.4-39.6-92.9-44s-10.8-6.7-15.6 6.7c-4.8 13.4-35.1 44-43.1 52.1-8 8.1-16 9.2-30.6 3.1-14.6-6.2-61-22.5-116.2-71.9-43-37.8-71.4-84.9-83.8-99.3-12.4-14.4-1.9-22.1 .8-29.2 2.3-6.2 10.8-16.1 16.2-22.7 5.4-6.7 7.2-11.4 10.8-19.1 3.6-7.6 1.8-14.1-3.6-20.8-5.4-6.7-15.6-37.5-21.4-51.3-5.8-13.8-11.6-12-16.4-12.2-4.8-.2-10.8-.2-15.6-.2s-12.4 1.8-18.2 8.5c-5.8 6.7-23.4 22.9-23.4 55.9 0 33 23.9 64.8 27.4 69.5 3.5 4.8 47.1 75.7 114.2 101.1 16.5 6.2 29.5 9.9 39.6 12.7 18.2 5.1 35.1 4.3 48.4 2.6 14.6-1.9 44-17.9 50.2-35.1 6.2-17.2 6.2-31.9 4.3-35.1z"/>
    </svg>
);

export const CalendarClockIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 10.5h.008v.008H12V10.5zm0 3h.008v.008H12V13.5zm0 3h.008v.008H12V16.5zm-3-3h.008v.008H9V13.5zm-3 0h.008v.008H6V13.5zm12 0h.008v.008H18V13.5zm-3-3h.008v.008H15V10.5zm-6 0h.008v.008H9V10.5z" />
    </svg>
);
