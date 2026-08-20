import React, { useState } from "react";
import { LandingHeader } from "./LandingHeader";
import { DarkHeroSection } from "./DarkHeroSection";
import { PipelineSection } from "./PipelineSection";
import { GostBlueprintSection } from "./GostBlueprintSection";
import { PricingCardsSection } from "./PricingCardsSection";
import { FaqAccordionSection } from "./FaqAccordionSection";
import { MinimalFooter } from "./MinimalFooter";
import { DocxPreviewModal } from "./DocxPreviewModal";

interface LandingPageProps {
  onStartGenerator: () => void;
  onOpenDashboard: () => void;
  onSelectPlan: (planId: string) => void;
  activeTab?: "landing" | "wizard" | "dashboard";
  onTabChange?: (tab: "landing" | "wizard" | "dashboard") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGenerator,
  onOpenDashboard,
  onSelectPlan,
  activeTab = "landing",
  onTabChange
}) => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative selection:bg-zinc-700 selection:text-white font-sans">
      
      {/* Top Fixed / Sticky Navigation Header */}
      <LandingHeader
        onStartClick={onStartGenerator}
        onOpenDashboard={onOpenDashboard}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Main Sections */}
      <main className="flex-1 w-full flex flex-col">
        
        {/* 1. Hero Section (Video Placeholder & Value Prop) */}
        <DarkHeroSection
          onStartClick={onStartGenerator}
          onPreviewDocxClick={() => setIsPreviewModalOpen(true)}
        />

        {/* 2. Interactive Pipeline (3 Steps to Done) */}
        <PipelineSection />

        {/* 3. Anatomy of an Ideal Page (Interactive GOST Blueprint) */}
        <GostBlueprintSection />

        {/* 4. Pricing Cards (3 Tiers) */}
        <PricingCardsSection
          onSelectPlan={onSelectPlan}
          onStartGenerator={onStartGenerator}
        />

        {/* 5. Academic Guarantees & FAQ (Accordion) */}
        <FaqAccordionSection />

      </main>

      {/* 6. Minimal Footer */}
      <MinimalFooter />

      {/* Interactive .docx Sample Preview Modal */}
      <DocxPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onStartClick={onStartGenerator}
      />

    </div>
  );
};

export default LandingPage;
