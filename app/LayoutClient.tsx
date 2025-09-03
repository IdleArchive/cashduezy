"use client";

import { useState } from "react";
import HeaderClient from "./HeaderClient";
import FooterClient from "./FooterClient";
import LoginModal from "./components/LoginModal";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <HeaderClient onLoginClick={() => setIsLoginOpen(true)} />
      <main className="flex-1">{children}</main>
      <FooterClient />
      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
