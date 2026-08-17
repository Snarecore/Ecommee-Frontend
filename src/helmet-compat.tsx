'use client';

import React from "react";

export function HelmetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Helmet() {
  return null;
}
export default Helmet;
