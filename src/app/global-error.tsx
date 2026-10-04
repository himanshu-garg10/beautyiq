"use client";

import * as React from "react";

/** Last-resort app recovery for an unexpected client runtime error. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en"><body className="bg-[#FAF7F2] text-[#262420]"><main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", textAlign: "center" }}><div><p style={{ color: "#96764B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "12px" }}>BeautyIQ recovery</p><h1 style={{ fontSize: "30px", margin: "16px 0 8px" }}>Let’s reload this page.</h1><p style={{ color: "#5C574D", maxWidth: "430px" }}>A temporary browser error interrupted the page. Your account and selections are not affected.</p><button type="button" onClick={reset} style={{ marginTop: "22px", border: 0, borderRadius: "12px", background: "#4B5A3E", color: "white", fontWeight: 700, padding: "12px 20px", cursor: "pointer" }}>Try again</button></div></main></body></html>
  );
}
