import { AppPromoSection } from "@/components/marketing/AppPromo";
import { ClientsStrip } from "@/components/marketing/ClientsStrip";
import { DigestPreviewSection } from "@/components/marketing/DigestPreview";
import { FeaturePanel } from "@/components/marketing/FeaturePanel";
import { MarketingFooter } from "@/components/marketing/Footer";
import { GetStartedSection } from "@/components/marketing/GetStarted";
import { HeroSection } from "@/components/marketing/Hero";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { MarketingNav } from "@/components/marketing/Nav";
import { StatsStrip } from "@/components/marketing/StatsStrip";

export default function HomePage() {
  return (
    <MarketingLayout>
      <section className="relative bg-[#050816]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(124,58,237,0.40),transparent_34%),radial-gradient(circle_at_86%_9%,rgba(37,99,235,0.30),transparent_34%)]" />
        <div className="relative z-10">
          <MarketingNav />
          <HeroSection />
        </div>
      </section>

      <section className="bg-[#070A12]">
        <FeaturePanel />
      </section>

      <section className="bg-[#070A12]">
        <StatsStrip />
      </section>

      <section className="bg-[linear-gradient(180deg,#B9A7FF_0%,#C7B6FF_40%,#D9D0FF_100%)]">
        <DigestPreviewSection />
      </section>

      <section className="bg-[#050816]">
        <AppPromoSection />
      </section>

      <section className="bg-[linear-gradient(180deg,#C7C4FF_0%,#D7D6FF_50%,#E7E7FF_100%)]">
        <GetStartedSection />
      </section>

      <section className="bg-[linear-gradient(180deg,#C7C4FF_0%,#D7D6FF_50%,#E7E7FF_100%)]">
        <ClientsStrip />
      </section>

      <section className="bg-[#050816]">
        <MarketingFooter />
      </section>
    </MarketingLayout>
  );
}
