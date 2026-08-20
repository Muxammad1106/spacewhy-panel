"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createPhoneChallenge,
  getCurrentPrincipal,
  verifyPhoneChallenge,
  type Principal,
} from "../lib/spacewhy-api";
import styles from "./panel.module.css";

type AuthStep = "phone" | "code" | "authenticated";

const financeUrl = process.env.NEXT_PUBLIC_FINANCE_URL ?? "https://finance.spacewhy.uz";

export function PanelApp() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const token = window.sessionStorage.getItem("spacewhy_access_token");
    if (!token) return;
    getCurrentPrincipal(token)
      .then((current) => {
        setPrincipal(current);
        setStep("authenticated");
      })
      .catch(() => {
        window.sessionStorage.removeItem("spacewhy_access_token");
        setStep("phone");
      });
  }, []);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const challenge = await createPhoneChallenge(phone);
      setChallengeId(challenge.challenge_id);
      setStep("code");
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId) return;
    setPending(true);
    setError("");
    try {
      const session = await verifyPhoneChallenge(challengeId, code);
      window.sessionStorage.setItem("spacewhy_access_token", session.access_token);
      setPrincipal(session.principal);
      setStep("authenticated");
    } catch (requestError) {
      setError(messageFor(requestError));
    } finally {
      setPending(false);
    }
  }

  if (step !== "authenticated") {
    return (
      <main className={styles.authShell}>
        <div className={styles.orbOne} /><div className={styles.orbTwo} />
        <section className={styles.authCard} aria-labelledby="auth-title">
          <Brand />
          <div className={styles.authCopy}>
            <span className={styles.eyebrow}>Единый Spacewhy ID</span>
            <h1 id="auth-title">{step === "phone" ? "Войдите по номеру телефона" : "Код уже в Telegram"}</h1>
            <p>{step === "phone" ? "Укажите номер, который вы подтвердили в боте Spacewhy." : `Мы отправили шестизначный код на номер ${phone}.`}</p>
          </div>
          {step === "phone" ? (
            <form onSubmit={requestCode} className={styles.form}>
              <label htmlFor="phone">Номер телефона</label>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" value={phone} onChange={(event) => setPhone(event.target.value)} required minLength={8} maxLength={32} />
              <button type="submit" disabled={pending}>{pending ? "Отправляем…" : "Получить код в Telegram"}<ArrowIcon /></button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className={styles.form}>
              <label htmlFor="code">Код подтверждения</label>
              <input id="code" name="code" className={styles.codeInput} type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required pattern="[0-9]{6}" />
              <button type="submit" disabled={pending || code.length !== 6}>{pending ? "Проверяем…" : "Войти в Spacewhy"}<ArrowIcon /></button>
              <button type="button" className={styles.secondaryButton} onClick={() => { setCode(""); setError(""); setStep("phone"); }}>Изменить номер</button>
            </form>
          )}
          <p className={styles.error} role="alert" aria-live="polite">{error}</p>
          <p className={styles.securityNote}><ShieldIcon /> Код действует ограниченное время и не передаётся другим SpaceDrop.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.dashboard}>
      <header className={styles.header}>
        <Brand />
        <div className={styles.profile}>
          <span className={styles.statusDot} /><span>{principal?.display_name ?? "Spacewhy user"}</span>
          <button type="button" aria-label="Выйти" onClick={() => { window.sessionStorage.removeItem("spacewhy_access_token"); setPrincipal(null); setStep("phone"); }}><LogoutIcon /></button>
        </div>
      </header>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Ваше пространство</span>
        <h1>Все SpaceDrop в одном месте.</h1>
        <p>Выберите инструмент — единая авторизация уже активна.</p>
      </section>
      <section className={styles.apps} aria-label="SpaceDrop приложения">
        <a className={styles.financeCard} href={financeUrl}>
          <div className={styles.appIcon}><WalletIcon /></div>
          <div className={styles.cardTopline}><span>FINANCE</span><span className={styles.ready}>Доступен</span></div>
          <h2>Доходы и расходы без лишнего шума.</h2>
          <p>Счета, категории, операции и понятная картина денег — в Telegram и браузере.</p>
          <span className={styles.openAction}>Открыть SpaceDrop <ArrowIcon /></span>
        </a>
        <article className={styles.upcomingCard}>
          <div className={styles.plus}>+</div><span>Следующий SpaceDrop</span><p>Новые инструменты Spacewhy появятся здесь.</p>
        </article>
      </section>
    </main>
  );
}

function messageFor(error: unknown) {
  if (error instanceof Error && error.message === "429") return "Слишком много попыток. Подождите немного и попробуйте снова.";
  return "Не удалось продолжить. Проверьте номер или код и повторите попытку.";
}

function Brand() { return <div className={styles.brand}><span className={styles.brandMark}>S</span><span>spacewhy</span></div>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.9 8.1 7 10 4.1-1.9 7-5.4 7-10V6l-7-3Z" /><path d="m9.5 12 1.7 1.7 3.6-4" /></svg>; }
function WalletIcon() { return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 9.5A3.5 3.5 0 0 1 8.5 6h14A3.5 3.5 0 0 1 26 9.5v13a3.5 3.5 0 0 1-3.5 3.5h-14A3.5 3.5 0 0 1 5 22.5v-13Z" /><path d="M21 14h6v6h-6a3 3 0 0 1 0-6Z" /><circle cx="21.5" cy="17" r=".8" /></svg>; }
function LogoutIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 8l4 4-4 4m4-4H9" /></svg>; }
