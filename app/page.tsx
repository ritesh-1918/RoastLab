import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AuditDimensions } from "@/components/landing/audit-dimensions";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <AuditDimensions />
      <Pricing />
      <Footer />
    </main>
  );
}
