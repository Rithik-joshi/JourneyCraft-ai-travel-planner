import React, { useEffect, useMemo, useState } from "react";
import {
  Plane,
  Compass,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
  ArrowRight,
  Sparkles,
  Heart,
  Mountain,
  UtensilsCrossed,
  Camera,
  Palmtree,
  ShoppingBag,
  Check,
  Bookmark,
  Trash2,
  Download,
  Clock,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  ArrowLeft,
  Info,
  Sun,
  CloudSun,
  Moon,
  RefreshCw,
  ExternalLink,
  Pencil,
  Save,
  SunMoon,
  Search,
} from "lucide-react";
const SUGGESTIONS = [
  "Manali, India",
  "Jaipur, India",
  "Delhi, India",
  "Himachal Pradesh, India",
  "Goa, India",
  "Udaipur, India",
  "Rishikesh, India",
  "Bali, Indonesia",
  "Kyoto, Japan",
  "Paris, France",
  "Dubai, UAE",
  "Swiss Alps, Switzerland",
];
const INTERESTS = [
  { name: "Adventure", icon: Mountain },
  { name: "Nature", icon: Palmtree },
  { name: "Food", icon: UtensilsCrossed },
  { name: "Sightseeing", icon: Camera },
  { name: "Shopping", icon: ShoppingBag },
  { name: "Relaxation", icon: Heart },
];
import {
  DESTINATIONS,
  getDestinationImage,
  DEFAULT_IMAGE,
} from "./destinationImages.js";
const money = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
const today = new Date().toLocaleDateString("en-CA");
const addDays = (d, n) => {
  const date = new Date(d + "T12:00:00");
  date.setDate(date.getDate() + n);
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
};
const initial = {
  destination: "",
  startDate: addDays(today, 14),
  endDate: addDays(today, 18),
  travelers: 2,
  budget: "moderate",
  interests: ["Nature", "Food", "Sightseeing"],
};
function App() {
  const [dark, setDark] = useState(
      () => localStorage.getItem("JourneyCraft-theme") === "dark",
    ),
    [editing, setEditing] = useState(null),
    [form, setForm] = useState(initial),
    [trip, setTrip] = useState(null),
    [mode, setMode] = useState(""),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [view, setView] = useState("home"),
    [saved, setSaved] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem("JourneyCraft-trips") || "[]");
      } catch {
        return [];
      }
    }),
    [expanded, setExpanded] = useState(1),
    [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    localStorage.setItem("JourneyCraft-trips", JSON.stringify(saved));
  }, [saved]);
  useEffect(() => {
    localStorage.setItem("JourneyCraft-theme", dark ? "dark" : "light");
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleInterest = (name) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(name)
        ? f.interests.filter((x) => x !== name)
        : [...f.interests, name],
    }));
  const days = useMemo(
    () =>
      Math.round(
        (new Date(form.endDate + "T12:00:00") -
          new Date(form.startDate + "T12:00:00")) /
          86400000,
      ) + 1,
    [form.startDate, form.endDate],
  );
  const generate = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Unable to generate itinerary");
      setTrip(data.trip);
      setMode(data.mode);
      setExpanded(1);
      setView("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const save = () => {
    if (!trip) return;
    setSaved((s) => [
      { ...trip, id: Date.now() },
      ...s.filter(
        (t) => !(t.title === trip.title && t.startDate === trip.startDate),
      ),
    ]);
  };
  const savedCurrent =
    trip &&
    saved.some((t) => t.title === trip.title && t.startDate === trip.startDate);
  const print = () => window.print();
  const editActivity = (dayIndex, activityIndex, field, value) =>
    setTrip((t) => ({
      ...t,
      days: t.days.map((d, di) =>
        di === dayIndex
          ? {
              ...d,
              activities: d.activities.map((a, ai) =>
                ai === activityIndex ? { ...a, [field]: value } : a,
              ),
            }
          : d,
      ),
    }));
  const mapLink = (name) =>
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(name + ", " + (trip?.destination || ""));
  const nav = (next) => {
    setView(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="app">
      <header className="header">
        <div className="shell nav">
          <button className="brand" onClick={() => nav("home")}>
            <span className="brand-icon">
              <Compass size={23} />
            </span>{" "}
            Journey<span>Craft</span>
            <span className="brand-dot"></span>
          </button>
          <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
            <button
              onClick={() => nav("home")}
              className={view === "home" ? "active" : ""}
            >
              Explore
            </button>
            <button
              onClick={() => nav("planner")}
              className={view === "planner" ? "active" : ""}
            >
              Plan a trip
            </button>
            <button
              onClick={() => nav("saved")}
              className={view === "saved" ? "active" : ""}
            >
              Saved trips <span className="nav-count">{saved.length}</span>
            </button>
          </nav>
          <button
            className="theme-toggle"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            onClick={() => setDark((v) => !v)}
          >
            <SunMoon size={19} />
          </button>
          <button className="nav-cta" onClick={() => nav("planner")}>
            Start planning <ArrowRight size={16} />
          </button>
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {view === "home" && (
        <>
          <section className="hero">
            <div className="hero-overlay" />
            <div className="shell hero-inner">
              <div className="eyebrow light">
                <Sparkles size={14} /> YOUR JOURNEY, REIMAGINED
              </div>
              <h1>
                Go places.
                <br />
                <em>Make memories.</em>
              </h1>
              <p>
                Your dream trip is just a few clicks away. Let AI craft a
                personalized itinerary built around what you love.
              </p>
              <button
                className="primary hero-button"
                onClick={() => nav("planner")}
              >
                Plan my adventure <ArrowRight size={18} />
              </button>
              <div className="hero-proof">
                <span className="proof-avatars">🌎 ✈️ 🧳</span>
                <span>Made for curious explorers everywhere</span>
              </div>
            </div>
            <div className="hero-caption">
              <MapPin size={14} /> The world is waiting for you
            </div>
          </section>
          <section className="shell discovery">
            <div className="section-top">
              <div>
                <div className="eyebrow">THE WORLD IS YOURS</div>
                <h2>
                  Where to <em>next?</em>
                </h2>
                <p>Discover inspiring destinations and start dreaming.</p>
              </div>
              <button className="text-link" onClick={() => nav("planner")}>
                Build your own trip <ArrowRight size={17} />
              </button>
            </div>
            <div className="destination-grid">
              {DESTINATIONS.map((d) => (
                <button
                  className="destination-card"
                  key={d.name}
                  onClick={() => {
                    set("destination", d.name);
                    nav("planner");
                  }}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                  <div className="destination-shade" />
                  <span className="destination-tag">{d.tag}</span>
                  <div className="destination-info">
                    <h3>{d.name}</h3>
                    <p>
                      <MapPin size={14} />
                      {d.country}
                    </p>
                  </div>
                  <span className="destination-arrow">
                    <ArrowRight size={20} />
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="how shell">
            <div className="eyebrow">EASY AS 1, 2, 3</div>
            <h2>
              Less planning. <em>More living.</em>
            </h2>
            <div className="steps">
              {[
                {
                  icon: MapPin,
                  title: "Tell us where",
                  desc: "Pick your dream destination and travel dates.",
                },
                {
                  icon: Heart,
                  title: "Make it yours",
                  desc: "Choose your interests, budget and travel style.",
                },
                {
                  icon: Sparkles,
                  title: "Let AI do its magic",
                  desc: "Get a custom day-by-day plan in seconds.",
                },
              ].map((s, i) => (
                <div className="step" key={s.title}>
                  <div className="step-icon">
                    <s.icon size={25} />
                  </div>
                  <span>0{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="bottom-cta">
            <div className="shell">
              <Sparkles size={27} />
              <h2>Your next story starts here.</h2>
              <p>Unforgettable experiences. Zero planning stress.</p>
              <button className="primary" onClick={() => nav("planner")}>
                Create my itinerary <ArrowRight size={18} />
              </button>
            </div>
          </section>
        </>
      )}
      {view === "planner" && (
        <main className="shell planner-page">
          <div className="page-intro">
            <div className="eyebrow">
              <Sparkles size={15} /> YOUR PERSONAL TRAVEL DESIGNER
            </div>
            <h1>
              Let's plan something <em>amazing.</em>
            </h1>
            <p>A few details are all we need to create your perfect getaway.</p>
          </div>
          <div className="planner-layout">
            <form className="planner-card" onSubmit={generate}>
              <div className="form-section">
                <div className="form-heading">
                  <span className="number">01</span>
                  <div>
                    <h3>Where & when?</h3>
                    <p>Every great adventure starts somewhere.</p>
                  </div>
                </div>
                <label className="field-label" htmlFor="destination">
                  Your destination
                </label>
                <div className="input-wrap">
                  <MapPin size={19} />
                  <input
                    id="destination"
                    required
                    maxLength="80"
                    placeholder="e.g. Manali, India"
                    value={form.destination}
                    onChange={(e) => set("destination", e.target.value)}
                  />
                </div>
                <div className="suggestions">
                  {form.destination.trim() &&
                    SUGGESTIONS.filter(
                      (x) =>
                        x
                          .toLowerCase()
                          .includes(form.destination.toLowerCase()) &&
                        x.toLowerCase() !== form.destination.toLowerCase(),
                    )
                      .slice(0, 4)
                      .map((x) => (
                        <button
                          type="button"
                          key={x}
                          onClick={() => set("destination", x)}
                        >
                          <Search size={13} />
                          {x}
                        </button>
                      ))}
                </div>
                <div className="two-fields">
                  <div>
                    <label className="field-label" htmlFor="start">
                      Start date
                    </label>
                    <div className="input-wrap">
                      <CalendarDays size={18} />
                      <input
                        id="start"
                        type="date"
                        required
                        min={today}
                        value={form.startDate}
                        onChange={(e) => {
                          setForm((f) => ({
                            ...f,
                            startDate: e.target.value,
                            endDate:
                              f.endDate < e.target.value
                                ? e.target.value
                                : f.endDate,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="end">
                      End date
                    </label>
                    <div className="input-wrap">
                      <CalendarDays size={18} />
                      <input
                        id="end"
                        type="date"
                        required
                        min={form.startDate}
                        value={form.endDate}
                        onChange={(e) => set("endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-hint">
                  {days >= 1 && days <= 14
                    ? `${days} day${days === 1 ? "" : "s"} of adventure`
                    : "Choose between 1 and 14 days"}
                </div>
              </div>
              <div className="form-section">
                <div className="form-heading">
                  <span className="number">02</span>
                  <div>
                    <h3>Your travel style</h3>
                    <p>Let's make this trip feel like you.</p>
                  </div>
                </div>
                <label className="field-label">Number of travelers</label>
                <div className="counter">
                  <Users size={19} />
                  <span>Travelers</span>
                  <button
                    type="button"
                    onClick={() =>
                      set("travelers", Math.max(1, form.travelers - 1))
                    }
                  >
                    −
                  </button>
                  <strong>{form.travelers}</strong>
                  <button
                    type="button"
                    onClick={() =>
                      set("travelers", Math.min(12, form.travelers + 1))
                    }
                  >
                    +
                  </button>
                </div>
                <label className="field-label budget-label">Your budget</label>
                <div className="budget-options">
                  {[
                    { id: "budget", label: "Budget", desc: "Keep it simple" },
                    { id: "moderate", label: "Comfort", desc: "Best of both" },
                    { id: "luxury", label: "Luxury", desc: "Treat yourself" },
                  ].map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => set("budget", b.id)}
                      className={
                        form.budget === b.id
                          ? "budget-option selected"
                          : "budget-option"
                      }
                    >
                      <span className="radio-circle" />
                      <strong>{b.label}</strong>
                      <small>{b.desc}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-section last">
                <div className="form-heading">
                  <span className="number">03</span>
                  <div>
                    <h3>What makes you happy?</h3>
                    <p>Choose the experiences you love most.</p>
                  </div>
                </div>
                <div className="interest-grid">
                  {INTERESTS.map(({ name, icon: Icon }) => (
                    <button
                      type="button"
                      key={name}
                      className={
                        form.interests.includes(name)
                          ? "interest selected"
                          : "interest"
                      }
                      onClick={() => toggleInterest(name)}
                    >
                      <Icon size={19} />
                      {name}
                      {form.interests.includes(name) && (
                        <Check size={15} className="interest-check" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}
              <button
                className="primary generate"
                type="submit"
                disabled={loading || days < 1 || days > 14}
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Creating your adventure...
                  </>
                ) : (
                  <>
                    <Sparkles size={19} /> Generate my itinerary{" "}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p className="privacy">
                <Info size={13} /> Plans and prices are estimates, not verified
                bookings or live availability.
              </p>
            </form>
            <aside className="planner-side">
              <div className="side-photo">
                <div className="side-photo-shade" />
                <div>
                  <span>YOUR ADVENTURE AWAITS</span>
                  <h3>
                    Collect moments,
                    <br />
                    not things.
                  </h3>
                  <p>We'll handle the planning. You make the memories.</p>
                </div>
              </div>
              <div className="side-perks">
                <h3>Why JourneyCraft?</h3>
                <p>
                  <Check size={17} /> Tailored to your travel style
                </p>
                <p>
                  <Check size={17} /> Smart budget breakdowns
                </p>
                <p>
                  <Check size={17} /> Day-by-day activity plans
                </p>
                <p>
                  <Check size={17} /> Save and revisit your trips
                </p>
              </div>
            </aside>
          </div>
        </main>
      )}
      {view === "result" && trip && (
        <main className="shell result-page">
          <button className="back-link" onClick={() => nav("planner")}>
            <ArrowLeft size={17} /> Edit trip details
          </button>
          <div
            className="result-hero"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(15,48,47,.94), rgba(15,48,47,.75)), url("${getDestinationImage(trip.destination)}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="eyebrow">
              <Sparkles size={14} /> YOUR PERSONALIZED ITINERARY
            </div>
            <h1>{trip.title}</h1>
            <p>{trip.summary}</p>
            <div className="result-chips">
              <span>
                <CalendarDays size={15} />
                {trip.startDate} → {trip.endDate}
              </span>
              <span>
                <Users size={15} />
                {trip.travelers} travelers
              </span>
              <span>
                <MapPin size={15} />
                {trip.destination}
              </span>
            </div>
          </div>
          <div className="result-actions">
            <span className="mode-note">
              <Sparkles size={15} />
              {mode === "demo"
                ? "Sample itinerary · Add an API key for personalized AI plans"
                : mode === "saved"
                  ? "Saved itinerary"
                  : "Generated with AI"}
            </span>
            <div>
              <button className="secondary" onClick={save}>
                <Bookmark size={17} />
                {savedCurrent ? "Saved again" : "Save trip"}
              </button>
              <button className="secondary" onClick={print}>
                <Download size={17} /> Print / PDF
              </button>
              <button
                className="primary compact"
                onClick={() => nav("planner")}
              >
                <RefreshCw size={16} /> New trip
              </button>
            </div>
          </div>
          <div className="result-layout">
            <div>
              <div className="result-section-title">
                <div>
                  <div className="eyebrow">YOUR DAY-BY-DAY GUIDE</div>
                  <h2>
                    The adventure <em>unfolds.</em>
                  </h2>
                </div>
                <span>{trip.days?.length || 0} days</span>
              </div>
              <div className="day-list">
                {trip.days?.map((day) => (
                  <article className="day-card" key={day.day}>
                    <button
                      className="day-header"
                      onClick={() =>
                        setExpanded(expanded === day.day ? 0 : day.day)
                      }
                    >
                      <span className="day-number">
                        DAY {String(day.day).padStart(2, "0")}
                      </span>
                      <strong>{day.title}</strong>
                      {expanded === day.day ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    {expanded === day.day && (
                      <div className="activities">
                        {day.activities?.map((a, i) => (
                          <div className="activity" key={i}>
                            <div className="activity-icon">
                              {i === 0 ? (
                                <Sun size={19} />
                              ) : i === 1 ? (
                                <CloudSun size={19} />
                              ) : (
                                <Moon size={19} />
                              )}
                            </div>
                            <div>
                              <span className="activity-time">
                                <Clock size={13} />
                                {a.time} · {a.category}
                              </span>
                              <h4>
                                {editing === `${day.day}-${i}` ? (
                                  <input
                                    className="edit-field"
                                    aria-label="Activity title"
                                    value={a.title}
                                    onChange={(e) =>
                                      editActivity(
                                        day.day - 1,
                                        i,
                                        "title",
                                        e.target.value,
                                      )
                                    }
                                  />
                                ) : (
                                  a.title
                                )}
                              </h4>
                              {editing === `${day.day}-${i}` ? (
                                <textarea
                                  className="edit-field"
                                  aria-label="Activity description"
                                  rows={3}
                                  value={a.description}
                                  onChange={(e) =>
                                    editActivity(
                                      day.day - 1,
                                      i,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <p>{a.description}</p>
                              )}
                              <small>Est. {money(a.cost)}</small>
                              <div className="activity-tools">
                                <a
                                  href={mapLink(a.title)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MapPin size={14} /> Find on Maps{" "}
                                  <ExternalLink size={12} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditing(
                                      editing === `${day.day}-${i}`
                                        ? null
                                        : `${day.day}-${i}`,
                                    )
                                  }
                                >
                                  {editing === `${day.day}-${i}` ? (
                                    <Save size={14} />
                                  ) : (
                                    <Pencil size={14} />
                                  )}{" "}
                                  {editing === `${day.day}-${i}`
                                    ? "Done"
                                    : "Edit"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
            <aside className="budget-sidebar">
              <div className="budget-card">
                <div className="eyebrow">ESTIMATED TRIP COST</div>
                <h2>{money(trip.estimatedBudget)}</h2>
                <p>
                  For {trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}{" "}
                  · Entire trip
                </p>
                <div className="budget-bars">
                  {Object.entries(trip.budgetBreakdown || {}).map(
                    ([name, value]) => (
                      <div className="budget-row" key={name}>
                        <div>
                          <span>{name}</span>
                          <strong>{money(value)}</strong>
                        </div>
                        <div className="bar">
                          <span
                            style={{
                              width: `${Math.min(100, (100 * Number(value)) / Math.max(1, Number(trip.estimatedBudget)))}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
                <small>
                  Approximate INR costs. Actual prices vary by season and
                  availability.
                </small>
              </div>
              <div className="tips-card">
                <h3>✦ Good to know</h3>
                {trip.tips?.map((tip, i) => (
                  <p key={i}>{tip}</p>
                ))}
              </div>
            </aside>
          </div>
        </main>
      )}
      {view === "saved" && (
        <main className="shell saved-page">
          <div className="page-intro">
            <div className="eyebrow">
              <Bookmark size={15} /> YOUR TRAVEL COLLECTION
            </div>
            <h1>
              Trips worth <em>remembering.</em>
            </h1>
            <p>All your saved adventures, in one happy place.</p>
          </div>
          {saved.length === 0 ? (
            <div className="empty-state">
              <span>🧳</span>
              <h2>No saved trips yet</h2>
              <p>Start planning an adventure and save it here for later.</p>
              <button className="primary" onClick={() => nav("planner")}>
                Plan a trip <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="saved-grid">
              {saved.map((s) => (
                <article className="saved-card" key={s.id}>
                  <div className="eyebrow">
                    <MapPin size={14} /> {s.destination}
                  </div>
                  <h3>{s.title}</h3>
                  <p>
                    <CalendarDays size={15} />
                    {s.startDate} — {s.endDate}
                  </p>
                  <p>
                    <Users size={15} />
                    {s.travelers} travelers
                  </p>
                  <strong>{money(s.estimatedBudget)}</strong>
                  <div>
                    <button
                      className="primary compact"
                      onClick={() => {
                        setTrip(s);
                        setMode("saved");
                        setExpanded(1);
                        nav("result");
                      }}
                    >
                      View itinerary <ArrowRight size={16} />
                    </button>
                    <button
                      className="delete"
                      aria-label="Delete trip"
                      onClick={() =>
                        setSaved((a) => a.filter((t) => t.id !== s.id))
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      )}
      <footer className="footer">
        <div className="shell footer-inner">
          <div className="footer-brand">
            <Compass size={21} /> JourneyCraft
          </div>
          <p>Go further. Feel more. Travel better.</p>
          <span>
            © {new Date().getFullYear()} JourneyCraft · Made for explorers
          </span>
        </div>
      </footer>
    </div>
  );
}
export default App;
