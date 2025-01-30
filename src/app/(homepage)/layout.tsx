import Header from "@/components/Header";
import React, { type ReactNode } from "react";
import Footer from "./_components/Footer";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
