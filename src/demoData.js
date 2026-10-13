export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

const createdAt = new Date();
const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const demoProfiles = {
  donor: {
    id: "10000000-0000-4000-8000-000000000001", name: "Green Harvest Restaurant", email: "hello@greenharvest.example",
    role: "donor", roleLabel: "Donor", roleDescription: "A neighborhood restaurant sharing fresh, safely prepared surplus meals and ingredients.",
    location: "Maple Market District, Brookhaven", phone: "+1 (202) 555-0141", address: "18 Orchard Lane, Brookhaven",
    organization: "Green Harvest Restaurant", verificationStatus: "verified", verified: true, createdAt: createdAt.toISOString()
  },
  recipient: {
    id: "20000000-0000-4000-8000-000000000002", name: "Hope Community Kitchen", email: "welcome@hopekitchen.example",
    role: "recipient", roleLabel: "Receiver", roleDescription: "A community kitchen collecting good food and turning it into welcoming meals for local families.",
    location: "Riverside Commons, Brookhaven", phone: "+1 (202) 555-0142", address: "42 Riverside Walk, Brookhaven",
    organization: "Hope Community Kitchen", verificationStatus: "verified", verified: true, createdAt: createdAt.toISOString()
  },
  ngo: {
    id: "30000000-0000-4000-8000-000000000003", name: "Food For All Foundation", email: "connect@foodforall.example",
    role: "ngo", roleLabel: "Verified NGO", roleDescription: "A fictional, verified nonprofit coordinating neighborhood food rescue and family deliveries.",
    location: "Cedar Park, Brookhaven", phone: "+1 (202) 555-0143", address: "7 Cedar Park Road, Brookhaven",
    organization: "Food For All Foundation", verificationStatus: "verified", verified: true, createdAt: createdAt.toISOString()
  },
  admin: {
    id: "40000000-0000-4000-8000-000000000004", name: "FoodLink Admin", email: "admin@foodlink.example",
    role: "admin", roleLabel: "Administrator", roleDescription: "The demo operations profile monitoring community donations, NGO verification, claims, and distributions.",
    location: "FoodLink Community Office, Brookhaven", phone: "+1 (202) 555-0144", address: "1 Community Square, Brookhaven",
    organization: "FoodLink Demo Team", verificationStatus: "verified", verified: true, createdAt: createdAt.toISOString()
  }
};

const donor = demoProfiles.donor;
const receiver = demoProfiles.recipient;
const ngo = demoProfiles.ngo;
const pendingNgo = {
  id: "70000000-0000-4000-8000-000000000007", name: "Brookhaven Meal Share", email: "apply@brookhavenmeals.example",
  phone: "+1 (202) 555-0147", organization: "Brookhaven Meal Share", registrationNumber: "DEMO-PENDING-17"
};

function donation(id, title, description, quantity, unit, servings, category, location, pickupTime, expiryHours, options = {}) {
  return {
    id, title, description, quantity: `${quantity} ${unit}`, quantityValue: quantity, unit, servings, category, location, pickupTime,
    preparedAt: hoursAgo(2), expiresAt: hoursFromNow(expiryHours), status: options.status || "available",
    createdAt: hoursAgo(expiryHours + 3), donorId: options.donorId || donor.id,
    donorName: options.donorName || donor.name, claimId: options.claimId || null,
    claimedBy: options.claimedBy || null, claimedByName: options.claimedByName || null,
    claimedAt: options.claimedAt || null, pickupStatus: options.pickupStatus || null,
    scheduledPickup: options.scheduledPickup || null
  };
}

export const demoInitialDonations = [
  donation("a1000000-0000-4000-8000-000000000001", "Seasonal vegetable boxes", "Colorful carrots, greens, squash, and herbs from this morning's local delivery.", 12, "crates", 48, "Vegetables", "Maple Market District", "Today, 4:00–6:00 PM", 13),
  donation("a1000000-0000-4000-8000-000000000002", "Fresh sourdough loaves", "Unsliced country sourdough baked this morning. Packed in clean paper bags.", 18, "loaves", 36, "Bakery", "Old Mill Bakery Row", "Today, 3:30–5:00 PM", 10, { donorId: "50000000-0000-4000-8000-000000000005", donorName: "Old Mill Community Bakery" }),
  donation("a1000000-0000-4000-8000-000000000003", "Lentil and rice lunch bowls", "Chilled vegetarian lunch bowls with lentils, brown rice, and roasted vegetables.", 24, "bowls", 24, "Prepared meals", "Green Harvest Restaurant", "Today, 5:00–6:00 PM", 8, { status: "claimed", claimId: "b1000000-0000-4000-8000-000000000001", claimedBy: receiver.id, claimedByName: receiver.name, claimedAt: hoursAgo(1), pickupStatus: "scheduled", scheduledPickup: "Today, 5:30 PM" }),
  donation("a1000000-0000-4000-8000-000000000004", "Orchard apples and pears", "A mixed crate of crisp apples and ripe pears, sorted and ready for collection.", 10, "crates", 80, "Fruit", "West Brookhaven Orchard Stand", "Today, 2:00–5:00 PM", 17),
  donation("a1000000-0000-4000-8000-000000000005", "Milk and plain yogurt", "Sealed, refrigerated dairy items with clear use-by labels. Keep chilled during transport.", 24, "cartons", 48, "Dairy", "Maple Market District", "Today, 1:00–3:00 PM", 7),
  donation("a1000000-0000-4000-8000-000000000006", "Hearty vegetable soup", "A mild vegetable and white bean soup, cooled promptly and stored refrigerated.", 16, "liters", 64, "Prepared meals", "Green Harvest Restaurant", "Today, 4:30–6:00 PM", 11),
  donation("a1000000-0000-4000-8000-000000000007", "Pantry staples bundle", "Sealed rice, oats, lentils, and canned tomatoes bundled for community pantry shelves.", 20, "bundles", 60, "Pantry", "Riverside Commons Pantry Door", "Tomorrow, 9:00–11:00 AM", 30),
  donation("a1000000-0000-4000-8000-000000000008", "Mixed greens and fresh herbs", "Washed salad greens with parsley and cilantro, packed in reusable food-safe crates.", 8, "crates", 32, "Vegetables", "Cedar Park Growers Market", "Today, 3:00–5:00 PM", 9, { donorId: "60000000-0000-4000-8000-000000000006", donorName: "Cedar Park Growers Co-op" }),
  donation("a1000000-0000-4000-8000-000000000009", "Breakfast oat cups", "Ready-to-heat apple cinnamon oats in labeled single-serve containers.", 30, "cups", 30, "Prepared meals", "Green Harvest Restaurant", "Tomorrow, 7:00–9:00 AM", 25, { status: "collected", claimId: "b1000000-0000-4000-8000-000000000002", claimedBy: ngo.id, claimedByName: ngo.name, claimedAt: hoursAgo(5), pickupStatus: "collected", scheduledPickup: "Today, 10:30 AM" }),
  donation("a1000000-0000-4000-8000-000000000010", "Farmhouse dinner rolls", "Soft whole-grain rolls from today's final bake, cooled and packed in batches of six.", 12, "packs", 72, "Bakery", "Old Mill Bakery Row", "Today, 4:00–6:00 PM", 15, { donorId: "50000000-0000-4000-8000-000000000005", donorName: "Old Mill Community Bakery" })
];

let donations = demoInitialDonations.map((item) => ({ ...item }));
let activeRole = (() => {
  try {
    const saved = localStorage.getItem("foodlink_demo_role");
    return Object.hasOwn(demoProfiles, saved) ? saved : "donor";
  } catch { return "donor"; }
})();
let profiles = Object.fromEntries(Object.entries(demoProfiles).map(([key, value]) => [key, { ...value }]));
let ngoStatus = "verified";
let pendingNgoStatus = "pending";
let audit = [{ id: "audit-demo-1", action: "DEMO_DATA_READY", targetId: "FoodLink", at: hoursAgo(1) }];
let sequence = 20;

export function getActiveDemoUser() { return { ...profiles[activeRole] }; }

export function switchDemoRole(role) {
  if (!Object.hasOwn(profiles, role)) return getActiveDemoUser();
  activeRole = role;
  try { localStorage.setItem("foodlink_demo_role", role); } catch { /* Demo still works when storage is disabled. */ }
  return getActiveDemoUser();
}

function currentUser() { return profiles[activeRole]; }
function jsonBody(options) {
  if (!options?.body) return {};
  try { return JSON.parse(options.body); } catch { return {}; }
}
function listingView(item) { return { ...item, quantityLabel: item.quantity }; }

function dashboardData() {
  const user = currentUser();
  const mine = donations.filter((item) => item.donorId === user.id);
  const claims = donations.filter((item) => item.claimedBy === user.id);
  const distributions = donations.filter((item) => item.status === "collected" && (item.donorId === user.id || item.claimedBy === user.id))
    .map((item) => ({ id: `distribution-${item.id}`, listingId: item.id, collectedAt: item.claimedAt || item.createdAt, donorId: item.donorId, receiverId: item.claimedBy }));
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    stats: {
      donated: mine.length,
      available: mine.filter((item) => item.status === "available").length,
      mealsShared: mine.filter((item) => ["claimed", "collected"].includes(item.status)).length,
      claimed: claims.length,
      distributions: distributions.length
    },
    myListings: mine.map(listingView),
    claimedListings: claims.map(listingView),
    distributions
  };
}

function adminStats() {
  return {
    users: 5, donors: 1, receivers: 3, pendingNgos: pendingNgoStatus === "pending" ? 1 : 0,
    donations: donations.length, available: donations.filter((item) => item.status === "available").length,
    claims: donations.filter((item) => item.claimId).length,
    distributions: donations.filter((item) => item.status === "collected").length
  };
}

function adminUsers() {
  const registered = Object.values(profiles).map((profile) => ({
    id: profile.id, name: profile.name, email: profile.email, role: profile.role, phone: profile.phone,
    address: profile.address, organization: profile.organization,
    verificationStatus: profile.role === "ngo" ? ngoStatus : profile.verificationStatus,
    createdAt: profile.createdAt
  }));
  registered.push({ id: pendingNgo.id, name: pendingNgo.name, email: pendingNgo.email, phone: pendingNgo.phone, role: "ngo", organization: pendingNgo.organization, verificationStatus: pendingNgoStatus, createdAt: hoursAgo(18) });
  return registered;
}

function adminClaims() {
  return donations.filter((item) => item.claimId).map((item) => ({
    id: item.claimId, donationId: item.id, title: item.title,
    status: item.status === "collected" ? "completed" : "active", claimedAt: item.claimedAt,
    donorName: item.donorName, receiverName: item.claimedByName,
    pickupStatus: item.pickupStatus, scheduledPickup: item.scheduledPickup
  }));
}

export async function requestDemo(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = jsonBody(options);
  const route = path.split("?")[0];

  if (route === "/listings" && method === "GET") {
    return { listings: donations.filter((item) => item.status === "available").sort((a, b) => a.expiresAt.localeCompare(b.expiresAt)).map(listingView) };
  }
  if (route === "/listings" && method === "POST") {
    if (currentUser().role !== "donor") throw new Error("Switch to the donor demo profile to publish a donation.");
    if (!body.title || !body.description || !(Number(body.quantity) > 0) || !body.location || !body.expiresAt) throw new Error("Complete the donation details with a positive quantity and expiry time.");
    const id = crypto.randomUUID();
    const item = {
      id, title: body.title, description: body.description, quantity: `${body.quantity} ${body.unit || "servings"}`,
      quantityValue: Number(body.quantity), unit: body.unit || "servings", servings: Number(body.quantity),
      category: body.category || "Prepared meals", location: body.location, pickupTime: body.pickupTime || "Contact donor to arrange",
      preparedAt: body.preparedAt || null, expiresAt: body.expiresAt, status: "available", createdAt: new Date().toISOString(),
      donorId: currentUser().id, donorName: currentUser().name, claimId: null, claimedBy: null, claimedByName: null,
      claimedAt: null, pickupStatus: null, scheduledPickup: null
    };
    donations.unshift(item);
    return { listing: listingView(item) };
  }
  if (route === "/dashboard" && method === "GET") return dashboardData();
  if (route === "/auth/me" && method === "GET") return { user: { ...currentUser() } };
  if (route === "/auth/me" && method === "PATCH") {
    profiles[activeRole] = { ...currentUser(), ...body, name: body.name?.trim() || currentUser().name };
    return { user: { ...currentUser() } };
  }
  if (route === "/auth/login" || route === "/auth/register") return { token: "demo-session", user: getActiveDemoUser() };

  const detailMatch = route.match(/^\/listings\/([0-9a-f-]{36})$/i);
  if (detailMatch && method === "GET") {
    const item = donations.find((entry) => entry.id === detailMatch[1]);
    if (!item) throw new Error("Donation not found in the demo data.");
    return { listing: listingView(item) };
  }
  const claimMatch = route.match(/^\/listings\/([0-9a-f-]{36})\/claim$/i);
  if (claimMatch && method === "POST") {
    if (!(["recipient", "ngo"].includes(currentUser().role))) throw new Error("Switch to a receiver or NGO demo profile to claim food.");
    if (currentUser().role === "ngo" && ngoStatus !== "verified") throw new Error("This sample NGO must be verified by the administrator before claiming food.");
    const item = donations.find((entry) => entry.id === claimMatch[1]);
    if (!item || item.status !== "available") throw new Error("This demo donation is no longer available.");
    item.status = "claimed"; item.claimId = crypto.randomUUID(); item.claimedBy = currentUser().id;
    item.claimedByName = currentUser().name; item.claimedAt = new Date().toISOString(); item.pickupStatus = "pending";
    return { listing: listingView(item) };
  }
  const pickupMatch = route.match(/^\/listings\/([0-9a-f-]{36})\/pickup$/i);
  if (pickupMatch && method === "PUT") {
    const item = donations.find((entry) => entry.id === pickupMatch[1]);
    if (!item || item.status === "available" || item.status === "cancelled") throw new Error("This demo donation has not been claimed.");
    if (currentUser().id !== item.donorId && currentUser().id !== item.claimedBy) throw new Error("Switch to the donor or claiming receiver demo profile to manage this pickup.");
    if (body.action === "schedule") {
      item.scheduledPickup = body.pickupTime || "Tomorrow, 10:00 AM"; item.pickupStatus = "scheduled";
    } else if (body.action === "confirm") {
      item.status = "collected"; item.pickupStatus = "collected";
      item.claimedAt ||= new Date().toISOString();
      audit.unshift({ id: `audit-${++sequence}`, action: "DISTRIBUTION_CONFIRMED", targetId: item.id, at: new Date().toISOString() });
    }
    return { listing: listingView(item) };
  }
  if (detailMatch && method === "DELETE") {
    const item = donations.find((entry) => entry.id === detailMatch[1]);
    if (!item || item.donorId !== currentUser().id || item.status !== "available") throw new Error("Only your available demo donations can be cancelled.");
    item.status = "cancelled";
    return { message: "Demo donation cancelled." };
  }

  if (route === "/admin/stats" && method === "GET") return { stats: adminStats() };
  if (route === "/admin/users" && method === "GET") return { users: adminUsers() };
  if (route === "/admin/claims" && method === "GET") return { claims: adminClaims() };
  if (route === "/admin/ngos" && method === "GET") return { ngos: [
    { id: ngo.id, name: ngo.name, email: ngo.email, phone: ngo.phone, organization: ngo.organization, registrationNumber: "DEMO-NGO-2048", verificationStatus: ngoStatus, verified: ngoStatus === "verified", reviewNotes: "Fictional sample verification record." },
    { id: pendingNgo.id, name: pendingNgo.name, email: pendingNgo.email, phone: pendingNgo.phone, organization: pendingNgo.organization, registrationNumber: pendingNgo.registrationNumber, verificationStatus: pendingNgoStatus, verified: pendingNgoStatus === "verified", reviewNotes: "Fictional sample application awaiting review." }
  ] };
  if (route === "/admin/donations" && method === "GET") return { donations: donations.map((item) => ({ ...listingView(item) })) };
  if (route === "/admin/distributions" && method === "GET") return { distributions: donations.filter((item) => item.status === "collected").map((item) => ({ id: `distribution-${item.id}`, listingId: item.id, donorId: item.donorId, receiverId: item.claimedBy, collectedAt: item.claimedAt })) };
  if (route === "/admin/audit" && method === "GET") return { auditLogs: audit.map((entry) => ({ ...entry })) };
  const ngoReviewMatch = route.match(/^\/admin\/ngos\/([0-9a-f-]{36})$/i);
  if (ngoReviewMatch && method === "PATCH") {
    const target = ngoReviewMatch[1] === pendingNgo.id ? pendingNgo : ngoReviewMatch[1] === ngo.id ? ngo : null;
    if (!target) throw new Error("NGO application not found in the demo data.");
    const status = body.verified ? "verified" : "rejected";
    if (target.id === pendingNgo.id) pendingNgoStatus = status; else ngoStatus = status;
    audit.unshift({ id: `audit-${++sequence}`, action: body.verified ? "NGO_APPROVED" : "NGO_REJECTED", targetId: target.id, at: new Date().toISOString() });
    return { ngo: { id: target.id, organization: target.organization, verified: body.verified, verificationStatus: status } };
  }

  throw new Error(`Demo mode has no local handler for ${method} ${route}.`);
}
