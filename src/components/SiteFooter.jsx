import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, Send, ArrowDown, X } from "lucide-react";
import ZelligeOrnament from "./ZelligeOrnament";
import { useI18n } from "../i18n/LanguageContext";
import { useContact } from "../context/ContactContext";

const CONTACT_EMAIL = "contact@bladna.ma";
const INSTAGRAM_URL = "https://www.instagram.com/bladna01/";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SiteFooter() {
  const { t } = useI18n();
  const { isOpen, closeContact, requestKey } = useContact();
  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // { type: "success" | "error", text: string }

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/destinations", label: t("nav.destinations") },
    { to: "/cities", label: t("nav.cities") },
    { to: "/about", label: t("nav.about") },
  ];

  useEffect(() => {
    if (!isOpen || requestKey === 0) return;
    const frame = requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, requestKey]);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (status?.type === "error") setStatus(null);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t("contact.error.required");
    if (!form.email.trim()) next.email = t("contact.error.required");
    else if (!isValidEmail(form.email.trim())) next.email = t("contact.error.email");
    if (!form.subject.trim()) next.subject = t("contact.error.required");
    if (!form.message.trim()) next.message = t("contact.error.required");
    return next;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ type: "error", text: t("contact.error.fixFields") });
      return;
    }

    const subject = form.subject.trim();
    const body = [
      `${t("contact.mail.name")}: ${form.name.trim()}`,
      `${t("contact.mail.email")}: ${form.email.trim()}`,
      "",
      form.message.trim(),
    ].join("\n");
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setStatus({ type: "success", text: t("contact.status.ready", { email: CONTACT_EMAIL }) });
  };

  const inputClass = (field) =>
    "w-full rounded-xl border bg-white/85 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 transition focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 " +
    (errors[field] ? "border-[#c24141] ring-1 ring-[#c24141]/20" : "border-gold/30");

  return (
    <footer className="relative z-20 shrink-0 bg-[#14110d] text-white">
      {isOpen ? (
        <section
          id="contact"
          ref={sectionRef}
          aria-label={t("footer.contact")}
          className="scroll-mt-24 border-b border-gold/20 bg-linear-to-b from-[#1b1712] to-[#14110d] px-4 py-10 sm:px-6 sm:py-12 lg:px-10"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="relative mx-auto max-w-3xl text-center">
              <button
                type="button"
                onClick={closeContact}
                aria-label={t("contact.close")}
                className="absolute end-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/35 bg-white/5 text-white/80 transition hover:border-gold/70 hover:text-[#f4dfb0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#d3a24b]">
                {t("footer.contact")}
              </p>
              <ZelligeOrnament className="mx-auto mt-3 h-5 w-36 opacity-90" color="#d3a24b" />
              <h2 className="mt-4 pe-10 ps-10 font-display text-2xl font-medium leading-tight text-[#f8f3e6] sm:text-3xl">
                {t("contact.heading")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-[15px]">
                {t("contact.intro")}
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-gold/25 bg-[#f8f3e6]/6 p-5 text-center shadow-[0_16px_40px_-28px_rgba(0,0,0,0.6)]">
                  <p className="font-display text-lg font-medium text-[#f4dfb0] sm:text-xl">
                    {t("contact.closing")}
                  </p>
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#ddb35e] via-[#c9a24b] to-[#b3863d] px-5 py-2.5 text-sm font-semibold text-[#3d270e] shadow-[0_10px_24px_-12px_rgba(201,162,75,0.6)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  >
                    {t("contact.ctaToForm")}
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="group flex items-start gap-4 rounded-[1.2rem] border border-gold/25 bg-white/5 p-4 transition hover:border-gold/45 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-[#d3a24b]/15 text-[#d3a24b]">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d3a24b]">
                      {t("contact.emailLabel")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#f8f3e6] break-all">{CONTACT_EMAIL}</p>
                    <p className="mt-1 text-xs text-white/60">{t("contact.emailHint")}</p>
                  </div>
                </a>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("footer.instagramAria")}
                  className="group flex items-start gap-4 rounded-[1.2rem] border border-gold/25 bg-white/5 p-4 transition hover:border-gold/45 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-[#d3a24b]/15 text-[#d3a24b]">
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d3a24b]">
                      {t("contact.socialLabel")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#f8f3e6]">{t("footer.instagram")}</p>
                    <p className="mt-1 text-xs text-white/60">{t("contact.socialHint")}</p>
                  </div>
                </a>
              </div>

              <div
                ref={formRef}
                id="contact-form"
                className="scroll-mt-28 rounded-[1.5rem] border border-gold/30 bg-[#f8f3e6] p-5 text-ink shadow-[0_24px_60px_-36px_rgba(0,0,0,0.55)] sm:p-6"
              >
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                    {t("contact.formKicker")}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-medium text-ink sm:text-2xl">
                    {t("contact.formTitle")}
                  </h3>
                  <ZelligeOrnament className="mt-3 h-4 w-28 opacity-85" />
                </div>

                <form onSubmit={onSubmit} noValidate className="space-y-3.5">
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                        {t("contact.nameLabel")}
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder={t("contact.namePlaceholder")}
                        className={inputClass("name")}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "contact-name-error" : undefined}
                      />
                      {errors.name ? (
                        <p id="contact-name-error" className="mt-1.5 text-xs text-[#a63a3a]">{errors.name}</p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                        {t("contact.emailFieldLabel")}
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder={t("contact.emailPlaceholder")}
                        className={inputClass("email")}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "contact-email-error" : undefined}
                      />
                      {errors.email ? (
                        <p id="contact-email-error" className="mt-1.5 text-xs text-[#a63a3a]">{errors.email}</p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                      {t("contact.subjectLabel")}
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={onChange}
                      placeholder={t("contact.subjectPlaceholder")}
                      className={inputClass("subject")}
                      aria-invalid={Boolean(errors.subject)}
                      aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                    />
                    {errors.subject ? (
                      <p id="contact-subject-error" className="mt-1.5 text-xs text-[#a63a3a]">{errors.subject}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/70">
                      {t("contact.messageLabel")}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={onChange}
                      placeholder={t("contact.messagePlaceholder")}
                      className={inputClass("message") + " min-h-[110px] resize-y"}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "contact-message-error" : undefined}
                    />
                    {errors.message ? (
                      <p id="contact-message-error" className="mt-1.5 text-xs text-[#a63a3a]">{errors.message}</p>
                    ) : null}
                  </div>

                  {status ? (
                    <div
                      role={status.type === "error" ? "alert" : "status"}
                      className={
                        "rounded-xl border px-4 py-3 text-sm leading-relaxed " +
                        (status.type === "error"
                          ? "border-[#e3b4b4] bg-[#fdf1f1] text-[#7f2626]"
                          : "border-[#cfe3d6] bg-[#eef8f1] text-[#22543d]")
                      }
                    >
                      {status.text}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-relaxed text-ink/55">{t("contact.formNote")}</p>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#ddb35e] via-[#c9a24b] to-[#b3863d] px-6 py-2.5 text-sm font-semibold text-[#3d270e] shadow-[0_10px_24px_-12px_rgba(201,162,75,0.6)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-deep"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      {t("contact.send")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
        <div>
          <p className="font-display text-lg font-semibold uppercase tracking-[0.28em] text-[#d3a24b]">
            {t("brand.name")}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
            {t("footer.aboutText")}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("footer.instagramAria")}
              className="inline-flex items-center gap-2 rounded-full border border-[#d3a24b]/55 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#d3a24b] hover:text-[#d3a24b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3a24b]"
            >
              <Instagram className="h-4 w-4 text-[#d3a24b]" aria-hidden="true" />
              {t("footer.instagram")}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 transition hover:border-[#d3a24b] hover:text-[#d3a24b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3a24b]"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("contact.emailUs")}
            </a>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d3a24b]">
            {t("footer.navigation")}
          </p>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-white/75 transition hover:text-[#d3a24b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3a24b]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d3a24b]">
            {t("contact.socialLabel")}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-[#d3a24b]"
              >
                <Instagram className="h-4 w-4 text-[#d3a24b]" aria-hidden="true" />
                {t("footer.instagram")}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 transition hover:text-[#d3a24b]"
              >
                <Mail className="h-4 w-4 text-[#d3a24b]" aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-center sm:px-6 sm:text-start lg:px-10">
          <p className="text-xs text-white/60">{t("footer.tagline")}</p>
          <p className="text-[10px] leading-relaxed text-white/45">{t("footer.data")}</p>
        </div>
      </div>
    </footer>
  );
}
