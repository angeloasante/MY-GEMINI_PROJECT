import {
  Header,
  Hero,
  AppPreview,
  Features,
  PersonalMode,
  BusinessMode,
  FAQ,
  Footer,
} from "@/components/landing";

export const metadata = {
  title: "Cleir - Protection from the Noise",
  description: "Intelligent detection of manipulation, fraud, and legal risks for individuals and businesses.",
};

export default function LandingPage() {
  return (
    <div className="bg-neutral-950 text-white overflow-x-hidden antialiased selection:bg-rose-500/30 selection:text-rose-200">
      {/* Background dot pattern */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Navigation */}
      <Header />

      {/* Main Hero Wrapper */}
      <main className="sm:pt-40 sm:pb-24 flex flex-col pt-32 pb-20 relative items-center justify-center">
        {/* Background Effects */}
        <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none">
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-rose-600/10 blur-[120px] rounded-full opacity-60 mix-blend-screen" />
          <div
            className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Hero Content */}
        <Hero />

        {/* App Preview Section */}
        <AppPreview />

        {/* Features Section */}
        <Features />

        {/* Personal Mode Section */}
        <PersonalMode />

        {/* Business Mode Section */}
        <BusinessMode />

        {/* FAQ Section */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
