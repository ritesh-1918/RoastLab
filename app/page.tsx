import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ExampleAudit } from "@/components/landing/example-audit";
import { AuditDimensions } from "@/components/landing/audit-dimensions";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <ExampleAudit />
        <AuditDimensions />
        <Pricing />
        <Footer />
      </main>
    </>
  );
}
