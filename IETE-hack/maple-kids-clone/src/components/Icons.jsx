export default function Icons() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }} aria-hidden="true">
      <defs>
        <symbol id="i-close" viewBox="0 0 24 24">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </symbol>
        <symbol id="i-arrow-small-left" viewBox="0 0 24 24">
          <path d="M14.5 5L7.5 12l7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="i-arrow-left" viewBox="0 0 24 24">
          <path d="M19 12H5m0 0l6-6m-6 6l6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="i-arrow-right" viewBox="0 0 24 24">
          <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="i-arrow-long-right" viewBox="0 0 24 24">
          <path d="M3 12h17m0 0l-5.5-5.5M20 12l-5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </symbol>
        <symbol id="i-quiz" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path d="M9.2 9.2a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.1.9-1.1 1.7v.4" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" fill="none" />
          <circle cx="12" cy="16.6" r="1.15" fill="#fff" />
        </symbol>
        <symbol id="i-drop" viewBox="0 0 24 24">
          <path d="M12 2.5c3.6 4.6 6.5 8.3 6.5 12a6.5 6.5 0 1 1-13 0c0-3.7 2.9-7.4 6.5-12z" fill="currentColor" />
        </symbol>
        <symbol id="i-fact" viewBox="0 0 144 144">
          <ellipse transform="matrix(0.3827 -0.9239 0.9239 0.3827 -22.0726 110.966)" fill="#B4E4AC" cx="72" cy="72" rx="55" ry="55" />
          <circle fill="#02AE90" cx="72" cy="72" r="39.5" />
          <path
            fill="#FCC484"
            d="M79.8 51.1c-3.8-2.1-8.2-2.6-12.3-1.4-4.2 1.2-7.6 4-9.7 7.7-3.8 7-2 15.6 4.1 20.4.5.4 1 .8 1.6 1.1.2.1.4.2.6.4 1 1.4 1.5 3 1.6 4.7 3.1 0 5.9 0 5.8 0v-2.9c0-1.6.3-3.3 1-4.7.6-.4 1.2-.8 1.7-1.3 1.4-1.2 2.6-2.7 3.6-4.4 3.7-6.4.8-16.3-7-20.6z"
          />
          <path
            fill="#EB8623"
            d="M74 79v-7.8c1.6 0 2.2 0 2.2 0 .8 0 1.4-.7 1.4-1.5 0-.8-.7-1.4-1.5-1.4h-2.2v-1.1c0-.3-.1-.6-.3-.9-.6-.7-1.4-1.2-2.4-1.3-1 0-2.1.4-2.7 1.2-.6.6-2.2 2.2-1.5 3.9.4.8 1.3 1.3 2.2 1.2l1.8.1V79v5c1 0 1.9 0 2.9 0V79z"
          />
          <path fill="#fff" d="M74 84c-1 0-2 0-2.9 0-2.8 0-5.3 0-5.4 0v2.6h5.4H74h5.8v-2.6C79.8 84.1 77.1 84.1 74 84z" />
          <path
            fill="#fff"
            d="M65.7 90.8c0 .1 0 .1 0 .2 0 .1 0 .1 0 .2 0 .1 0 .1.1.2 0 .1.1.2.1.3.1.1.1.1.2.2.1.1.2.1.4.2.1 0 .2 0 .3 0h1.7h8h1.5c.1 0 .2 0 .2 0 .1 0 .1 0 .2-.1.6-.2 1-.7 1-1.4v-1.2H65.7v1.4z"
          />
          <path fill="#EB8623" d="M73.1 92.2c-1.3 0-2.6 0-3.7 0v.3v.9v.1c0 .8.6 1.4 1.4 1.5h3.6c.8 0 1.4-.7 1.4-1.5v-.1v-.9v-.3c-1.1 0-2 0-2.7 0z" />
        </symbol>
        <symbol id="i-logo-jeunesse" viewBox="0 0 120 40">
          <path
            d="M14 6c2.2 0 4 .4 5.4 1.3 1.4.9 2.1 2.2 2.1 4 0 1.2-.3 2.2-1 3-.7.8-1.6 1.3-2.8 1.6v.1c1.5.2 2.7.8 3.5 1.8.8 1 1.2 2.2 1.2 3.7 0 2-.7 3.5-2.1 4.6-1.4 1.1-3.3 1.6-5.7 1.6H4V6h10zm-1.2 8.4c1.4 0 2.4-.3 3.1-.9.7-.6 1-1.4 1-2.5 0-1-.3-1.8-1-2.3-.7-.5-1.7-.8-3.1-.8h-4.6v6.5h4.6zm.3 9.6c1.5 0 2.7-.3 3.5-1 .8-.6 1.2-1.5 1.2-2.7 0-1.2-.4-2.1-1.2-2.7-.8-.6-2-.9-3.5-.9H8.2v7.3h4.9z"
            fill="#2A2B2A"
          />
          <path d="M33 6.5v19h-4.6v-19H33z" fill="#2A2B2A" />
          <path d="M40.5 6.5h4.6l6.2 19h-4.9l-1.2-4h-5.6l-1.2 4h-4.9l7-19zm.6 10.6h3.4l-1.7-5.6-1.7 5.6z" fill="#2A2B2A" />
          <path d="M57 6.5h4.6v19H57z" fill="#2A2B2A" />
          <path d="M67.5 6.5h4.6l6.2 19h-4.9l-1.2-4h-5.6l-1.2 4h-4.9l7-19zm.6 10.6h3.4l-1.7-5.6-1.7 5.6z" fill="#2A2B2A" />
          <path d="M84 6.5h4.6v19H84z" fill="#2A2B2A" />
          <path d="M94.5 6.5h4.6l6.2 19h-4.9l-1.2-4h-5.6l-1.2 4h-4.9l7-19zm.6 10.6h3.4l-1.7-5.6-1.7 5.6z" fill="#2A2B2A" />
          <path d="M60 32c-1.5 0-2.7-1.2-2.7-2.7s1.2-2.7 2.7-2.7 2.7 1.2 2.7 2.7-1.2 2.7-2.7 2.7z" fill="#EFB700" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Icon({ id, className, viewBox = '0 0 24 24' }) {
  return (
    <svg role="presentation" viewBox={viewBox} className={className}>
      <use href={`#${id}`} />
    </svg>
  );
}