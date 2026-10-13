import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "./api";
import { DEMO_MODE, demoProfiles, getActiveDemoUser, switchDemoRole } from "./demoData";
import { HeartHandshake, Leaf, MapPin, Clock3, Package, Search, Plus, LogIn, LogOut, LayoutDashboard, X, CheckCircle2, UtensilsCrossed, Users } from "lucide-react";

const emptyListing = { title: "", description: "", quantity: "", unit: "servings", category: "Prepared meals", location: "", pickupTime: "", preparedAt: "", expiresAt: "" };

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    if (DEMO_MODE) return getActiveDemoUser();
    try { return JSON.parse(localStorage.getItem("foodlink_user") || "null"); } catch { return null; }
  });
  const [listings, setListings] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState(DEMO_MODE ? "dashboard" : "browse");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "recipient", organization: "" });
  const [form, setForm] = useState(emptyListing);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminClaims, setAdminClaims] = useState([]);
  const [adminDonations, setAdminDonations] = useState([]);
  const [adminDistributions, setAdminDistributions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const viewPaths = { browse: "/browse", create: "/donations/new", dashboard: "/dashboard", admin: "/admin", profile: "/profile" };
  const navigateView = (nextView) => { setView(nextView); navigate(viewPaths[nextView] || "/"); };
  const showLogin = () => { setAuthMode("login"); setShowAuth(true); navigate("/login"); };
  const chooseDemoRole = (role) => {
    const profile = switchDemoRole(role);
    setUser(profile);
    setError("");
    setShowAuth(false);
    setDashboard(null);
    const nextView = profile.role === "admin" ? "admin" : "dashboard";
    setView(nextView);
    navigate(nextView === "admin" ? "/admin" : "/dashboard");
  };
  useEffect(() => {
    const pathname = location.pathname;
    if (DEMO_MODE && ["/", "/login", "/register"].includes(pathname)) {
      const destination = user?.role === "admin" ? "/admin" : "/dashboard";
      setView(user?.role === "admin" ? "admin" : "dashboard");
      setShowAuth(false);
      if (pathname !== "/") navigate(destination, { replace: true });
      return;
    }
    if (pathname === "/login" || pathname === "/register") {
      setAuthMode(pathname === "/login" ? "login" : "register"); setShowAuth(true);
    } else if (pathname === "/profile") {
      setView("profile"); setShowAuth(false);
    } else if (/^\/donations\/[0-9a-f-]{36}$/i.test(pathname)) {
      setDetailId(pathname.split("/").at(-1)); setView("details"); setShowAuth(false);
    } else {
      const page = Object.entries(viewPaths).find(([, route]) => route === pathname)?.[0];
      if (page) { setView(page); setShowAuth(false); } else setView("notFound");
    }
  }, [location.pathname, user?.role]);

  const loadListings = async () => {
    try {
      const data = await api("/listings");
      setListings(data.listings || []);
      setError("");
    } catch (e) { setError(`${e.message}. Is the backend running on port 8080?`); }
  };

  useEffect(() => { loadListings(); }, []);
  useEffect(() => {
    if (view === "dashboard" && user) {
      api("/dashboard").then(setDashboard).catch((e) => setError(e.message));
    }
  }, [view, user]);

  useEffect(() => {
    if (view === "details" && detailId) {
      setDetail(null);
      api(`/listings/${detailId}`).then((result) => setDetail(result.listing)).catch((e) => setError(e.message));
    }
  }, [view, detailId]);

  useEffect(() => {
    if (view === "profile" && user) {
      api("/auth/me").then(({ user: profile }) => setProfileForm({ name: profile.name || "", phone: profile.phone || "", address: profile.address || "" })).catch((e) => setError(e.message));
    }
  }, [view, user]);

  useEffect(() => {
    if (view !== "admin" || user?.role !== "admin") return;
    Promise.all([api("/admin/stats"), api("/admin/ngos"), api("/admin/donations"), api("/admin/distributions"), api("/admin/audit"), api("/admin/users"), api("/admin/claims")])
      .then(([stats, ngoData, donationData, distributionData, auditData, userData, claimData]) => { setAdminStats(stats.stats); setNgos(ngoData.ngos); setAdminDonations(donationData.donations); setAdminDistributions(distributionData.distributions); setAuditLogs(auditData.auditLogs); setAdminUsers(userData.users); setAdminClaims(claimData.claims); setError(""); })
      .catch((e) => setError(e.message));
  }, [view, user]);

  const visibleListings = useMemo(() => listings.filter((item) => {
    const text = `${item.title} ${item.description} ${item.location} ${item.category}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (category === "All" || item.category === category);
  }), [listings, query, category]);

  const flash = (message) => { setNotice(message); setError(""); window.setTimeout(() => setNotice(""), 3500); };
  const handleAuth = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const data = await api(endpoint, { method: "POST", body: JSON.stringify(authForm) });
      if (data.pendingVerification) { setShowAuth(false); navigate("/login"); setAuthMode("login"); setAuthForm({ name: "", email: "", password: "", role: "recipient", organization: "" }); flash(data.message); return; }
      localStorage.setItem("foodlink_token", data.token);
      localStorage.setItem("foodlink_user", JSON.stringify(data.user));
      setUser(data.user); setShowAuth(false); navigateView(data.user.role === "admin" ? "admin" : "dashboard"); setAuthForm({ name: "", email: "", password: "", role: "recipient", organization: "" });
      flash(`Welcome, ${data.user.name}!`);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const logout = () => {
    localStorage.removeItem("foodlink_token"); localStorage.removeItem("foodlink_user");
    setUser(null); setDashboard(null); navigateView("browse"); flash("You have been logged out.");
  };

  const createListing = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...form, preparedAt: form.preparedAt ? new Date(form.preparedAt).toISOString() : "", expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : "" };
      await api("/listings", { method: "POST", body: JSON.stringify(payload) });
      setForm(emptyListing); await loadListings(); navigateView("browse"); flash("Your food listing is now live!");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const claimListing = async (id) => {
    if (!user) { showLogin(); return; }
    if (!["recipient", "ngo"].includes(user.role)) { setError("Donor accounts cannot claim donations."); return; }
    try { const result = await api(`/listings/${id}/claim`, { method: "POST" }); if (view === "details") setDetail(result.listing); await loadListings(); flash("Claim confirmed! Coordinate pickup with the donor."); }
    catch (e) { setError(e.message); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Cancel this unclaimed donation?")) return;
    try { await api(`/listings/${id}`, { method: "DELETE" }); await loadListings(); if (user) api("/dashboard").then(setDashboard).catch(() => {}); flash("Donation cancelled."); }
    catch (e) { setError(e.message); }
  };

  const schedulePickup = async (id) => {
    const pickupTime = window.prompt("Enter the agreed pickup time (include the date):");
    if (!pickupTime?.trim()) return;
    try {
      await api(`/listings/${id}/pickup`, { method: "PUT", body: JSON.stringify({ action: "schedule", pickupTime: pickupTime.trim() }) });
      const data = await api("/dashboard"); setDashboard(data); flash("Pickup time saved.");
    } catch (e) { setError(e.message); }
  };

  const confirmPickup = async (id) => {
    if (!window.confirm("Confirm that this food has been collected? This records a distribution.")) return;
    try {
      await api(`/listings/${id}/pickup`, { method: "PUT", body: JSON.stringify({ action: "confirm" }) });
      const [data] = await Promise.all([api("/dashboard"), loadListings()]); setDashboard(data); flash("Collection confirmed and distribution recorded.");
    } catch (e) { setError(e.message); }
  };

  const reviewNgo = async (id, verified) => {
    try {
      await api(`/admin/ngos/${id}`, { method: "PATCH", body: JSON.stringify({ verified }) });
      const [ngoData, stats] = await Promise.all([api("/admin/ngos"), api("/admin/stats")]);
      setNgos(ngoData.ngos); setAdminStats(stats.stats); flash(verified ? "Organization approved." : "Organization rejected.");
    } catch (e) { setError(e.message); }
  };

  const saveProfile = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await api("/auth/me", { method: "PATCH", body: JSON.stringify(profileForm) });
      setUser(result.user); localStorage.setItem("foodlink_user", JSON.stringify(result.user)); flash("Profile saved.");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const openCreate = () => {
    if (!user) { showLogin(); return; }
    if (user.role !== "donor") { setError("Only donor accounts can publish food donations."); navigateView("browse"); return; }
    navigateView("create");
  };

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); navigateView("browse"); }}>
        <span className="brand-mark"><HeartHandshake size={23}/></span>
        <span>Food<span className="brand-accent">Link</span><small>Share food. Spread hope.</small></span>
      </a>
      <nav className="nav-links">
        <button className={view === "browse" ? "nav-item active" : "nav-item"} onClick={() => navigateView("browse")}>Find food</button>
        <button className="nav-item" onClick={openCreate}><Plus size={16}/> Donate food</button>
        {user && <button className={view === (user.role === "admin" ? "admin" : "dashboard") ? "nav-item active" : "nav-item"} onClick={() => navigateView(user.role === "admin" ? "admin" : "dashboard")}><LayoutDashboard size={16}/> {user.role === "admin" ? "Admin" : "Dashboard"}</button>}
      </nav>
      <div className="account-area">
        {DEMO_MODE ? <><span className="demo-mode-badge">Demo Mode</span><label className="demo-role-picker"><span className="sr-only">Switch sample user role</span><select aria-label="Switch sample user role" value={user.role} onChange={(event) => chooseDemoRole(event.target.value)}>{Object.entries(demoProfiles).map(([role, profile]) => <option key={role} value={role}>{profile.roleLabel}: {profile.name}</option>)}</select></label><button className="nav-item" onClick={() => navigate("/profile")}>Profile</button></> : user ? <><button className="nav-item" onClick={() => navigate("/profile")}>Profile</button><span className="user-pill"><span className="avatar">{user.name.charAt(0).toUpperCase()}</span><span className="user-name">{user.name}</span></span><button className="icon-button" title="Log out" onClick={logout}><LogOut size={18}/></button></> :
          <button className="button button-dark button-small" onClick={showLogin}><LogIn size={16}/> Sign in</button>}
      </div>
    </header>

    <main>
      {view === "browse" && <>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot"/> GOOD FOOD DESERVES A GOOD HOME</div>
            <h1>Less waste.<br/><span>More care.</span></h1>
            <p className="hero-copy">Connect surplus food with people who need it. A small act of sharing can make a big difference in your community.</p>
            <div className="hero-actions"><button className="button button-light" onClick={() => document.getElementById("food-listings")?.scrollIntoView({ behavior: "smooth" })}>Explore available food <span>â†˜</span></button><button className="hero-link" onClick={openCreate}>I have food to share <span>â†’</span></button></div>
            <div className="hero-proof"><div className="proof-avatars"><span>A</span><span>M</span><span>S</span><span>+</span></div><span>Neighbors helping neighbors</span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of fresh food"><div className="sun-shape"/><div className="art-card"><div className="art-tag"><Leaf size={14}/> GOODNESS, SHARED</div><div className="food-illustration"><span className="food-leaf leaf-one">âœ¦</span><span className="food-leaf leaf-two">âœ¦</span><span className="veggie veggie-orange">â—’</span><span className="veggie veggie-green">â—•</span><span className="veggie veggie-yellow">â—</span><span className="veggie veggie-red">â—</span><span className="veggie veggie-purple">â—</span><span className="veggie veggie-leaf">â§</span></div><div className="art-caption"><strong>Fresh food, brighter futures.</strong><span>Every meal matters.</span></div></div><div className="floating-note"><span className="note-icon"><HeartHandshake size={18}/></span><span><strong>One community</strong><small>Many ways to help</small></span></div></div>
          <div className="hero-bottom"><span><Leaf size={15}/> LOCAL FOOD, LOCAL IMPACT</span><span>01 â€” SHARE</span><span>02 â€” CONNECT</span><span>03 â€” NOURISH</span></div>
        </section>

        <section className="impact-strip">
          <div className="impact-intro"><span className="section-kicker">THE FOODLINK WAY</span><strong>Good food should<br/>never go to waste.</strong></div>
          <div className="impact-item"><span className="impact-icon mint"><UtensilsCrossed size={20}/></span><span><strong>Rescue surplus</strong><small>Give extra food a second life.</small></span></div>
          <div className="impact-item"><span className="impact-icon peach"><Users size={20}/></span><span><strong>Build community</strong><small>Bring neighbors closer together.</small></span></div>
          <div className="impact-item"><span className="impact-icon lilac"><Leaf size={20}/></span><span><strong>Make an impact</strong><small>Small shares add up to more.</small></span></div>
        </section>

        <section className="listing-section" id="food-listings">
          <div className="section-heading"><div><span className="section-kicker">A LITTLE GOOD, NEAR YOU</span><h2>Food available to share<span className="green-period">.</span></h2><p>Discover food listings from your local community.</p></div><button className="button button-outline" onClick={openCreate}><Plus size={17}/> Post a donation</button></div>
          <div className="filter-row"><div className="search-box"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food, category or location..."/></div><div className="category-filters">{["All", "Vegetables", "Bakery", "Prepared meals", "Fruit", "Dairy", "Pantry"].map((c) => <button key={c} onClick={() => setCategory(c)} className={category === c ? "filter-chip selected" : "filter-chip"}>{c}</button>)}</div></div>
          {error && <div className="alert error-alert">{error}</div>}{notice && <div className="alert success-alert"><CheckCircle2 size={17}/>{notice}</div>}
          <div className="listing-grid">
            {visibleListings.map((item, index) => <article className="food-card" key={item.id}>
              <div className={`food-card-art art-${index % 4}`}><span className="category-label">{item.category}</span><div className="food-symbol">{item.category.toLowerCase().includes("bakery") ? "ðŸ¥–" : item.category.toLowerCase().includes("vegetable") ? "ðŸ¥¬" : item.category.toLowerCase().includes("fruit") ? "ðŸŽ" : item.category.toLowerCase().includes("dairy") ? "ðŸ¥›" : "ðŸ¥—"}</div><span className="fresh-label"><span/> {item.status === "available" ? "Available" : "Claimed"}</span></div>
              <div className="food-card-body"><div className="card-title-row"><h3><button type="button" className="title-link" onClick={() => navigate("/donations/" + item.id)}>{item.title}</button></h3><span className="quantity-badge"><Package size={13}/>{item.quantity}{item.servings ? ` · ${item.servings} servings` : ""}</span></div><p className="card-description">{item.description}</p><div className="card-meta"><span><MapPin size={14}/>{item.location}</span><span><Clock3 size={14}/>{item.pickupTime}</span></div><div className="card-footer"><span className="donor"><span className="donor-avatar">{(item.donorName || "D").charAt(0)}</span>Shared by {item.donorName}</span>{item.status === "available" ? <button className="claim-button" onClick={() => claimListing(item.id)}>Claim food <span>â†’</span></button> : <span className="claimed-text"><CheckCircle2 size={14}/> Claimed</span>}</div></div>
            </article>)}
          </div>
          {!visibleListings.length && <div className="empty-state"><span>ðŸƒ</span><h3>No food found just yet</h3><p>Try another search, or be the first to share something.</p><button className="button button-dark" onClick={openCreate}>Post a donation</button></div>}
        </section>
        <section className="cta-banner"><div className="cta-icon"><HeartHandshake size={27}/></div><div><span className="section-kicker">YOUR EXTRA CAN BE SOMEONE'S ENOUGH</span><h2>Have good food to share?</h2><p>Make a difference today. It starts with one listing.</p></div><button className="button button-light" onClick={openCreate}>Share food with FoodLink <span>â†’</span></button></section>
      </>}

      {view === "details" && <section className="dashboard-page"><button className="button button-outline button-small" onClick={() => navigateView("browse")}>← Back to available food</button>{error && <div className="alert error-alert">{error}</div>}{!detail ? <div className="empty-state"><p>Loading donation details…</p></div> : <article className="panel" style={{marginTop:20}}><span className="section-kicker">DONATION DETAILS</span><h1>{detail.title}</h1><p>{detail.description}</p><div className="card-meta"><span><Package size={14}/>{detail.quantity}</span>{detail.servings && <span>Approximately {detail.servings} servings</span>}<span>{detail.category}</span><span><MapPin size={14}/>{detail.location}</span><span><Clock3 size={14}/>Pickup: {detail.pickupTime}</span><span>Expires: {new Date(detail.expiresAt).toLocaleString()}</span>{detail.preparedAt && <span>Prepared: {new Date(detail.preparedAt).toLocaleString()}</span>}</div><p>Shared by {detail.donorName}</p>{detail.status === "available" && <button className="button button-dark" onClick={() => claimListing(detail.id)}>Claim this food</button>}{detail.status !== "available" && <span className="status-tag claimed">{detail.status}</span>}</article>}</section>}
      {view === "profile" && <section className="form-page"><div className="form-intro"><span className="section-kicker">YOUR ACCOUNT</span><h1>Your profile<span className="green-period">.</span></h1><p>Manage the contact information connected to your FoodLink account.</p></div><div className="panel">{error && <div className="alert error-alert">{error}</div>}{!user ? <><p>Sign in to view and update your profile.</p><button className="button button-dark" onClick={showLogin}>Sign in</button></> : <form className="listing-form" onSubmit={saveProfile}><label>Full name<input required maxLength="120" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm,name:e.target.value})}/></label><label>Email address<input type="email" disabled value={user.email}/></label><label>Phone<input maxLength="32" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm,phone:e.target.value})}/></label><label>Address<input maxLength="500" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm,address:e.target.value})}/></label><button disabled={busy} className="button button-dark submit-button">{busy ? "Saving…" : "Save profile"}</button></form>}</div></section>}      {view === "create" && <section className="form-page"><div className="form-intro"><span className="section-kicker">PASS THE GOODNESS ON</span><h1>Share food.<br/><span>Share hope.</span></h1><p>Tell your community what you have available and when they can collect it.</p><div className="form-note"><HeartHandshake size={21}/><span>Thank you for helping good food reach good people.</span></div></div><form className="listing-form panel" onSubmit={createListing}><div className="panel-heading"><div><span className="section-kicker">NEW DONATION</span><h2>Create a food listing</h2></div><button type="button" className="icon-button" onClick={() => navigateView("browse")}><X size={18}/></button></div>{error && <div className="alert error-alert">{error}</div>}<label>Food title<input required value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} placeholder="e.g. Fresh vegetable boxes"/></label><label>Description<textarea required value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} placeholder="Describe the food and any important details..." rows="3"/></label><div className="form-two"><label>Quantity<input type="number" min="0.01" step="any" required value={form.quantity} onChange={(e) => setForm({...form, quantity:e.target.value})} placeholder="10"/></label><label>Unit<input required value={form.unit} onChange={(e) => setForm({...form, unit:e.target.value})} placeholder="boxes, servings"/></label><label>Category<select value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}><option>Prepared meals</option><option>Vegetables</option><option>Bakery</option><option>Fruit</option><option>Dairy</option><option>Pantry</option><option>Other</option></select></label></div><label>Pickup location<input required value={form.location} onChange={(e) => setForm({...form, location:e.target.value})} placeholder="Area, landmark or collection point"/></label><label>Pickup time<input required value={form.pickupTime} onChange={(e) => setForm({...form, pickupTime:e.target.value})} placeholder="Today, 5-7 PM"/></label><div className="form-two"><label>Prepared at<input type="datetime-local" value={form.preparedAt} onChange={(e) => setForm({...form, preparedAt:e.target.value})}/></label><label>Expires at<input type="datetime-local" required value={form.expiresAt} onChange={(e) => setForm({...form, expiresAt:e.target.value})}/></label></div><button className="button button-dark submit-button" disabled={busy}>{busy ? "Publishing..." : "Publish food listing"} <span>â†’</span></button><p className="form-footnote">Only list food that is safe to share. Clearly communicate storage, allergens and use-by information when relevant.</p></form></section>}

{view === "admin" && user?.role === "admin" && <section className="dashboard-page"><span className="section-kicker">FOODLINK OPERATIONS</span><h1>Administrator dashboard<span className="green-period">.</span></h1><p className="dashboard-sub">Review organizations and monitor food redistribution.</p>{DEMO_MODE && <div className="demo-profile-card panel"><span className="demo-profile-role">{user.roleLabel}</span><h2>{user.name}</h2><p>{user.roleDescription}</p><div><span><MapPin size={15}/>{user.location}</span><a href={`mailto:${user.email}`}>{user.email}</a><span>{user.phone}</span></div></div>}{error && <div className="alert error-alert">{error}</div>}
  <div className="stats-grid">{[["Users", adminStats?.users ?? 0],["Pending NGOs", adminStats?.pendingNgos ?? 0],["Donations", adminStats?.donations ?? 0],["Distributions", adminStats?.distributions ?? 0]].map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
  <div className="dashboard-list"><div className="panel-heading"><h2>Users</h2></div>{adminUsers.length ? adminUsers.map((entry) => <div className="dashboard-row" key={entry.id}><span className="row-main"><strong>{entry.name}</strong><small>{entry.email}{entry.organization ? ` · ${entry.organization}` : ""}</small></span><span className="status-tag">{entry.role}{entry.verificationStatus ? ` · ${entry.verificationStatus}` : ""}</span></div>) : <div className="empty-dashboard">No users recorded.</div>}</div>
  <div className="dashboard-list"><div className="panel-heading"><h2>NGO verification</h2></div>{ngos.length ? ngos.map((ngo) => <div className="dashboard-row" key={ngo.id}><span className="row-main"><strong>{ngo.organization || ngo.name}</strong><small>{ngo.name} · {ngo.email}</small></span><span className={ngo.verified ? "status-tag" : "status-tag claimed"}>{ngo.verificationStatus || (ngo.verified ? "verified" : "pending")}</span>{!ngo.verified && <><button className="button button-dark button-small" onClick={() => reviewNgo(ngo.id, true)}>Approve</button><button className="text-action" onClick={() => reviewNgo(ngo.id, false)}>Reject</button></>}</div>) : <div className="empty-dashboard">No NGO registrations yet.</div>}</div>
  <div className="dashboard-list" style={{marginTop:18}}><div className="panel-heading"><h2>Donation management</h2></div>{adminDonations.length ? adminDonations.map((item) => <div className="dashboard-row" key={item.id}><span className="row-main"><strong>{item.title}</strong><small>{item.quantity} · {item.donorName} · Expires {item.expiresAt ? new Date(item.expiresAt).toLocaleString() : "legacy record"}</small></span><span className={item.status === "available" ? "status-tag" : "status-tag claimed"}>{item.status}</span></div>) : <div className="empty-dashboard">No donations recorded.</div>}</div>
  <div className="dashboard-list" style={{marginTop:18}}><div className="panel-heading"><h2>Claims and pickups</h2></div>{adminClaims.length ? adminClaims.map((entry) => <div className="dashboard-row" key={entry.id}><span className="row-main"><strong>{entry.title}</strong><small>{entry.donorName} → {entry.receiverName} · {entry.scheduledPickup || "Pickup not scheduled"}</small></span><span className="status-tag">{entry.status} · {entry.pickupStatus || "pending"}</span></div>) : <div className="empty-dashboard">No claims recorded.</div>}</div>
  <div className="dashboard-list" style={{marginTop:18}}><div className="panel-heading"><h2>Distribution history and audit</h2></div>{adminDistributions.map((entry) => <div className="dashboard-row" key={entry.id}><span className="row-main"><strong>Distribution: {entry.listingId}</strong><small>{new Date(entry.collectedAt).toLocaleString()}</small></span></div>)}{auditLogs.map((entry) => <div className="dashboard-row" key={entry.id}><span className="row-main"><strong>{entry.action}</strong><small>{entry.targetId} · {new Date(entry.at).toLocaleString()}</small></span></div>)}{!adminDistributions.length && !auditLogs.length && <div className="empty-dashboard">No distribution or audit records yet.</div>}</div>
</section>}
{view === "admin" && user?.role !== "admin" && <section className="dashboard-page"><h1>Administrator access required.</h1><p>Sign in with an administrator account to continue.</p></section>}
      {view === "dashboard" && user?.role !== "admin" && <section className="dashboard-page">
  <span className="section-kicker">{DEMO_MODE ? "FOODLINK DEMO DASHBOARD" : "YOUR FOODLINK SPACE"}</span><h1>{DEMO_MODE ? `${user.roleLabel} dashboard` : "Your dashboard"}<span className="green-period">.</span></h1><p className="dashboard-sub">Every listing is a chance to make a difference.</p>{DEMO_MODE && <div className="demo-profile-card panel"><span className="demo-profile-role">{user.roleLabel}</span><h2>{user.name}</h2><p>{user.roleDescription}</p><div><span><MapPin size={15}/>{user.location}</span><a href={`mailto:${user.email}`}>{user.email}</a><span>{user.phone}</span></div></div>}{error && <div className="alert error-alert">{error}</div>}
  <div className="stats-grid">{(user?.role === "donor" ? [["Your donations", dashboard?.stats?.donated ?? 0, "Food listings created"],["Available now", dashboard?.stats?.available ?? 0, "Waiting to be collected"],["Claimed by others", dashboard?.stats?.mealsShared ?? 0, "Successful connections"],["Food you've claimed", dashboard?.stats?.claimed ?? 0, "Ready for pickup"]] : [["Available nearby", listings.length, "Sample donations to explore"],["Food claimed", dashboard?.stats?.claimed ?? 0, "Community collections"],["Collections completed", dashboard?.stats?.distributions ?? 0, "Recorded in this demo"],["Partner role", user?.role === "ngo" ? "NGO" : "Receiver", "Switch profiles above"]]).map(([label, value, desc]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><small>{desc}</small></div>)}</div>
  <div className="dashboard-list"><div className="panel-heading"><h2>Your food donations</h2>{user?.role === "donor" && <button className="button button-dark button-small" onClick={openCreate}><Plus size={15}/> New donation</button>}</div>
    {(dashboard?.myListings || []).length ? dashboard.myListings.map((item) => <div className="dashboard-row" key={item.id}><span className="row-food-icon">🥗</span><span className="row-main"><strong>{item.title}</strong><small>{item.quantity} · {item.location}</small></span><span className={item.status === "available" ? "status-tag" : "status-tag claimed"}>{item.status}</span>{item.status === "available" && <button className="text-action" onClick={() => deleteListing(item.id)}>Cancel</button>}</div>) : <div className="empty-dashboard"><p>You haven't posted any food yet.</p>{user?.role === "donor" && <button className="button button-outline" onClick={openCreate}>Create your first donation</button>}</div>}
  </div>
  <div className="dashboard-list" style={{marginTop:18}}><div className="panel-heading"><h2>Food you've claimed</h2></div>
    {(dashboard?.claimedListings || []).length ? dashboard.claimedListings.map((item) => <div className="dashboard-row" key={item.id}><span className="row-food-icon">🥗</span><span className="row-main"><strong>{item.title}</strong><small>{item.quantity} · {item.location} · Pickup: {item.scheduledPickup || item.pickupTime}</small></span><span className={item.status === "collected" ? "status-tag" : "status-tag claimed"}>{item.status}</span>{item.status === "claimed" && <><button className="button button-outline button-small" onClick={() => schedulePickup(item.id)}>Set pickup</button><button className="button button-dark button-small" onClick={() => confirmPickup(item.id)}>Confirm collection</button></>}</div>) : <div className="empty-dashboard"><p>You haven't claimed any food yet.</p><button className="button button-outline" onClick={() => navigateView("browse")}>Browse available food</button></div>}
  </div>
  {(dashboard?.distributions || []).length > 0 && <div className="dashboard-list" style={{marginTop:18}}><div className="panel-heading"><h2>Distribution history</h2></div>{dashboard.distributions.map((entry) => <div className="dashboard-row" key={entry.id}><span className="row-food-icon">✓</span><span className="row-main"><strong>Collection recorded</strong><small>{new Date(entry.collectedAt).toLocaleString()}</small></span><span className="status-tag">completed</span></div>)}</div>}
</section>}
      {view === "notFound" && <section className="dashboard-page"><span className="section-kicker">PAGE NOT FOUND</span><h1>That page isn’t here.</h1><p className="dashboard-sub">The address may be wrong or the page may have moved.</p><button className="button button-dark" onClick={() => navigateView("browse")}>Back to FoodLink</button></section>}
    </main>

    <footer className="footer"><a className="brand footer-brand" href="#" onClick={(e) => { e.preventDefault(); navigateView("browse"); }}><span className="brand-mark"><HeartHandshake size={20}/></span><span>Food<span className="brand-accent">Link</span><small>Share food. Spread hope.</small></span></a><span className="footer-message">A kinder food system starts with us.</span><span className="footer-copy">Â© 2026 FoodLink Â· Made for community</span></footer>

    {showAuth && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAuth(false); }}><div className="auth-modal"><button className="modal-close icon-button" onClick={() => setShowAuth(false)}><X size={19}/></button><span className="brand-mark modal-brand"><HeartHandshake size={25}/></span><span className="section-kicker">{authMode === "login" ? "WELCOME BACK" : "JOIN THE COMMUNITY"}</span><h2>{authMode === "login" ? "Good to see you." : "Let's do some good."}</h2><p>{authMode === "login" ? "Sign in to share or claim food near you." : "Create an account and help good food find a home."}</p>{error && <div className="alert error-alert">{error}</div>}{notice && <div className="alert success-alert">{notice}</div>}<form onSubmit={handleAuth} className="auth-form">{authMode === "register" && <label>Your name<input required value={authForm.name} onChange={(e) => setAuthForm({...authForm, name:e.target.value})} placeholder="Your full name"/></label>}<label>Email address<input type="email" required value={authForm.email} onChange={(e) => setAuthForm({...authForm, email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input type="password" minLength="10" required value={authForm.password} onChange={(e) => setAuthForm({...authForm, password:e.target.value})} placeholder="At least 10 characters"/></label>{authMode === "register" && <><label>Account type<select value={authForm.role} onChange={(e) => setAuthForm({...authForm, role:e.target.value})}><option value="recipient">Find / collect food</option><option value="donor">Donate surplus food</option><option value="ngo">Register an NGO</option></select></label>{authForm.role === "ngo" && <label>Organization<input required value={authForm.organization} onChange={(e) => setAuthForm({...authForm, organization:e.target.value})} placeholder="Registered organization name"/></label>}</>}<button disabled={busy} className="button button-dark submit-button">{busy ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"} <span>â†’</span></button></form><div className="auth-switch">{authMode === "login" ? "New to FoodLink?" : "Already have an account?"} <button onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setError(""); navigate(authMode === "login" ? "/register" : "/login"); }}> {authMode === "login" ? "Create an account" : "Sign in"}</button></div><div className="demo-credentials"><strong>New here?</strong><span>Create an account to continue.</span><small>The sample credentials are no longer enabled.</small></div></div></div>}
  </div>;
}

export default App;
