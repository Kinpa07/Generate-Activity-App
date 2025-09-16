import { useState, useEffect } from "react";
import logo from "../assets/logo-dark.png";


export default function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-normal transition-colors duration-300 bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Branding section */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-[var(--color-bg)] border-b md:border-b-0 md:border-r border-gray-700 px-6 py-10">
        <img
          src={logo}
          alt="Logo"
          className="h-24 md:h-28 lg:h-40 mb-4 md:mb-6 lg:mb-8"
        />
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading">
          Activity Generator
        </h1>
        <p className="mt-2 text-gray-400 text-center max-w-md text-sm md:text-base">
          Fun ideas, personalized for you
        </p>
      </div>

      {/* Form section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6 md:p-8">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6 text-center">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
}