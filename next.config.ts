import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // jsPDF uses browser APIs — keep it out of the server bundle entirely
  serverExternalPackages: ['jspdf'],
};

export default nextConfig;
