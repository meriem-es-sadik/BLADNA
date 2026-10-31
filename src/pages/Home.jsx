import Background from "../components/Background";
import HeroCard from "../components/HeroCard";
import Logo from "../components/Logo";
import SiteFooter from "../components/SiteFooter";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-stone-950 font-sans text-white antialiased">
      <Background />

      <Logo />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 pt-36 sm:px-8 md:justify-end md:px-12 md:pt-44 lg:px-16 lg:pt-48 xl:px-28">
        <div className="w-full max-w-md sm:max-w-lg">
          <HeroCard />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
