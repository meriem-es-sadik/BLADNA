import Background from "../components/Background";
import HeroCard from "../components/HeroCard";
import Logo from "../components/Logo";

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-stone-950 font-sans text-white antialiased">
      <Background />

      <Logo />

      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 pb-24 pt-40 sm:px-8 md:justify-end md:px-12 md:pt-32 lg:px-16 xl:px-28">
        <div className="w-full max-w-md sm:max-w-lg lg:translate-y-20">
          <HeroCard />
        </div>
      </main>
    </div>
  );
}
