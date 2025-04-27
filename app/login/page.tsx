"use client";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}