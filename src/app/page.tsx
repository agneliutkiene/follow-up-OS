import { FAQSection } from "@/components/marketing/FAQ";
import { FeaturePanel } from "@/components/marketing/FeaturePanel";
import { HeroSection } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingFooter } from "@/components/marketing/Footer";
import { MarketingNav } from "@/components/marketing/Nav";
import { PricingSection } from "@/components/marketing/Pricing";
import { StatsStrip } from "@/components/marketing/StatsStrip";
import { ClientsStrip } from "@/components/marketing/ClientsStrip";

export default function HomePage() {
  return (
    <MarketingLayout>
      <MarketingNav />
      <main>
        <HeroSection />
        <FeaturePanel />
        <StatsStrip />
        <HowItWorks />
        <ClientsStrip />
        <PricingSection />
        <FAQSection />
      </main>
      <MarketingFooter />
    </MarketingLayout>
  );
}
