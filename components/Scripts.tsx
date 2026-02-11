"use client"; // Sabse zaroori line

import Script from 'next/script';

export default function Scripts() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID" // Yahan tumhara ID hoga
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Scripts loaded!");
        }}
      />
    </>
  );
}
