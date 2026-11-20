import ZelligeOrnament from "./ZelligeOrnament";

export default function SectionIntro({
  kicker,
  title,
  intro,
  align = "center",
  light = false,
  className = "",
}) {
  const centered = align === "center";
  return (
    <div
      className={
        `${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`.trim()
      }
    >
      {kicker ? (
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px] ${
            light ? "text-[#f4dfb0]" : "text-gold-deep"
          }`}
        >
          {kicker}
        </p>
      ) : null}
      <ZelligeOrnament
        className={`mt-3 h-4 w-32 opacity-85 sm:w-36 ${centered ? "mx-auto" : ""}`}
        color={light ? "#f4dfb0" : "#d3a24b"}
      />
      {title ? (
        <h2
          className={`mt-3 font-display text-3xl font-medium leading-tight sm:text-[2.15rem] lg:text-[2.35rem] ${
            light ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>
      ) : null}
      {intro ? (
        <p
          className={`mt-3 text-sm leading-relaxed sm:text-[15px] ${
            light ? "text-white/75" : "text-ink/65"
          }`}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
