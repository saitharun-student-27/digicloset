import { chromium } from "playwright";

const APP_URL = "http://127.0.0.1:5173";
const API_URL = "http://127.0.0.1:8000/api";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function timestampLabel() {
  return `PW ${Date.now()}`;
}

async function createOutfit(payload) {
  return api("/outfits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function createPiece(payload) {
  return api("/clothing", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function favoriteOutfit(id) {
  return api(`/outfits/${id}/favorite`, { method: "POST", body: JSON.stringify({}) });
}

async function getOutfit(id) {
  const response = await fetch(`${API_URL}/outfits/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /outfits/${id} failed with ${response.status}`);
  }
  return response.json();
}

async function getPiece(id) {
  const response = await fetch(`${API_URL}/clothing/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GET /clothing/${id} failed with ${response.status}`);
  }
  return response.json();
}

async function cardByTitle(page, title) {
  const card = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .first();
  await card.waitFor({ state: "visible", timeout: 15000 });
  return card;
}

async function openCardActions(card) {
  const toggle = card.getByRole("button", {
    name: /Show outfit actions|Hide outfit actions/,
  });

  if (await toggle.count()) {
    await toggle.click();
  }
}

function fieldInput(page, labelText) {
  return page
    .locator(`label:has-text("${labelText}")`)
    .locator("xpath=following-sibling::*[1]");
}

async function goTo(page, label, urlPart) {
  await page.getByRole("link", { name: label, exact: true }).click();
  await page.waitForURL(`**${urlPart}`);
  await page.waitForLoadState("networkidle");
}

async function expectTextOnPage(page, text) {
  await page
    .getByText(text, { exact: true })
    .first()
    .waitFor({ state: "visible", timeout: 15000 });
}

async function expectTextNotOnPage(page, text) {
  await page.waitForTimeout(400);
  const count = await page.getByText(text, { exact: true }).count();
  assert(count === 0, `Expected "${text}" to be absent, but it was still visible.`);
}

async function run() {
  const runLabel = timestampLabel();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const titles = {
    favoriteFlow: `${runLabel} Favorite Flow`,
    wornFlow: `${runLabel} Worn Flow`,
    syncFlow: `${runLabel} Sync Flow`,
    deleteFlow: `${runLabel} Delete Flow`,
    editedSyncFlow: `${runLabel} Sync Flow Edited`,
  };

  const pieces = {
    standalone: `${runLabel} Standalone Piece`,
    standaloneEdited: `${runLabel} Standalone Piece Edited`,
    linkedOutfit: `${runLabel} Linked Outfit`,
    linkedPiece: `${runLabel} Linked Shirt`,
  };

  const favoriteFlowOutfit = await createOutfit({
    title: titles.favoriteFlow,
    description: "Browser verification favorite flow.",
    occasion: "casual",
    season: "summer",
    style: "minimal",
    source_type: "manual_build",
    pieces: [],
  });

  const wornFlowOutfit = await createOutfit({
    title: titles.wornFlow,
    description: "Browser verification worn flow.",
    occasion: "casual",
    season: "summer",
    style: "relaxed",
    source_type: "manual_build",
    pieces: [],
  });

  const syncFlowOutfit = await createOutfit({
    title: titles.syncFlow,
    description: "Browser verification sync flow.",
    occasion: "travel",
    season: "winter",
    style: "classic",
    source_type: "manual_build",
    pieces: [],
  });
  await favoriteOutfit(syncFlowOutfit.id);

  const deleteFlowOutfit = await createOutfit({
    title: titles.deleteFlow,
    description: "Browser verification delete flow.",
    occasion: "travel",
    season: "winter",
    style: "classic",
    source_type: "manual_build",
    pieces: [],
  });
  await favoriteOutfit(deleteFlowOutfit.id);

  const standalonePiece = await createPiece({
    name: pieces.standalone,
    category: "watch",
    color: "silver",
    season: "all",
    occasion: "casual",
    style: "clean",
    formality_level: "casual",
    source_type: "manual_piece",
  });

  const linkedOutfit = await createOutfit({
    title: pieces.linkedOutfit,
    description: "Browser verification linked piece flow.",
    occasion: "travel",
    season: "winter",
    style: "classic",
    source_type: "manual_build",
    pieces: [
      {
        name: pieces.linkedPiece,
        category: "shirt",
        color: "navy",
        slot: "upper",
        season: "winter",
        occasion: "travel",
        style: "classic",
        formality_level: "smart",
      },
      {
        name: `${runLabel} Linked Trousers`,
        category: "trousers",
        color: "grey",
        slot: "lower",
        season: "winter",
        occasion: "travel",
        style: "classic",
        formality_level: "smart",
      },
    ],
  });
  const linkedPieceId = linkedOutfit.outfit_items[0].clothing_item.id;

  await page.goto(APP_URL, { waitUntil: "networkidle" });

  // Flow 1: favorite from Home and verify in Wardrobe
  const favoriteCard = await cardByTitle(page, titles.favoriteFlow);
  await openCardActions(favoriteCard);
  await favoriteCard.getByRole("button", { name: /Favorite/ }).click();
  await goTo(page, "Wardrobe", "/wardrobe");
  const favoriteFitsSection = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Favorite Fits" }) })
    .first();
  await favoriteFitsSection.getByText(titles.favoriteFlow, { exact: true }).waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page.reload({ waitUntil: "networkidle" });
  await favoriteFitsSection.getByText(titles.favoriteFlow, { exact: true }).waitFor({
    state: "visible",
    timeout: 15000,
  });

  // Flow 2: mark worn in Suggestions and verify persistence plus Home visibility
  await goTo(page, "Suggestions", "/suggestions");
  const wornCard = await cardByTitle(page, titles.wornFlow);
  await openCardActions(wornCard);
  await wornCard.getByRole("button", { name: /Worn/ }).click();
  const wornPersisted = await getOutfit(wornFlowOutfit.id);
  assert(wornPersisted?.last_worn_date, "Expected worn outfit to persist a last_worn_date.");
  await goTo(page, "Home", "/");
  await expectTextOnPage(page, titles.wornFlow);
  await page.reload({ waitUntil: "networkidle" });
  await expectTextOnPage(page, titles.wornFlow);

  // Flow 3: edit outfit title in Wardrobe and verify Home + Suggestions
  await goTo(page, "Wardrobe", "/wardrobe");
  const syncCard = await cardByTitle(page, titles.syncFlow);
  await openCardActions(syncCard);
  await syncCard.getByRole("button", { name: /Edit/ }).click();
  await page.getByText("Update outfit details").waitFor({ state: "visible", timeout: 15000 });
  const titleInput = fieldInput(page, "Title");
  await titleInput.fill(titles.editedSyncFlow);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expectTextOnPage(page, titles.editedSyncFlow);
  await goTo(page, "Home", "/");
  await expectTextOnPage(page, titles.editedSyncFlow);
  await goTo(page, "Suggestions", "/suggestions");
  await expectTextOnPage(page, titles.editedSyncFlow);
  await page.reload({ waitUntil: "networkidle" });
  await expectTextOnPage(page, titles.editedSyncFlow);

  // Flow 4: delete outfit and verify disappearance everywhere
  await goTo(page, "Wardrobe", "/wardrobe");
  const deleteCard = await cardByTitle(page, titles.deleteFlow);
  page.once("dialog", (dialog) => dialog.accept());
  await openCardActions(deleteCard);
  await deleteCard.getByRole("button", { name: /Delete/ }).click();
  await expectTextNotOnPage(page, titles.deleteFlow);
  await goTo(page, "Home", "/");
  await expectTextNotOnPage(page, titles.deleteFlow);
  await goTo(page, "Suggestions", "/suggestions");
  await expectTextNotOnPage(page, titles.deleteFlow);
  await page.reload({ waitUntil: "networkidle" });
  await expectTextNotOnPage(page, titles.deleteFlow);

  // Flow 5: piece detail edit and persistence
  await page.goto(`${APP_URL}/pieces/${standalonePiece.id}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Edit piece" }).click();
  await page.getByText("Update piece details").waitFor({ state: "visible", timeout: 15000 });
  await fieldInput(page, "Name").fill(pieces.standaloneEdited);
  await fieldInput(page, "Color").fill("steel");
  await page.getByRole("button", { name: "Save piece" }).click();
  await expectTextOnPage(page, pieces.standaloneEdited);
  await expectTextOnPage(page, "steel");
  await goTo(page, "Wardrobe", "/wardrobe");
  await expectTextOnPage(page, pieces.standaloneEdited);
  await page.goto(`${APP_URL}/pieces/${standalonePiece.id}`, { waitUntil: "networkidle" });
  await expectTextOnPage(page, pieces.standaloneEdited);

  // Flow 6: linked piece delete protection
  await page.goto(`${APP_URL}/pieces/${linkedPieceId}`, { waitUntil: "networkidle" });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete piece" }).click();
  await page
    .getByText(
      "This clothing piece is linked to one or more outfit memories and cannot be deleted safely.",
      { exact: true },
    )
    .waitFor({ state: "visible", timeout: 15000 });
  await expectTextOnPage(page, pieces.linkedPiece);
  await expectTextOnPage(page, pieces.linkedOutfit);

  await browser.close();

  const favoritePersisted = await getOutfit(favoriteFlowOutfit.id);
  const syncPersisted = await getOutfit(syncFlowOutfit.id);
  const deletedPersisted = await getOutfit(deleteFlowOutfit.id);
  const piecePersisted = await getPiece(standalonePiece.id);
  const linkedPiecePersisted = await getPiece(linkedPieceId);

  assert(favoritePersisted?.is_favorite === true, "Favorite flow did not persist on the backend.");
  assert(syncPersisted?.title === titles.editedSyncFlow, "Edited outfit title did not persist.");
  assert(deletedPersisted === null, "Deleted outfit still exists on the backend.");
  assert(piecePersisted?.name === pieces.standaloneEdited, "Edited piece name did not persist.");
  assert(linkedPiecePersisted?.id === linkedPieceId, "Linked piece should still exist after blocked delete.");

  console.log(
    JSON.stringify(
      {
        status: "ok",
        favoriteOutfitId: favoriteFlowOutfit.id,
        wornOutfitId: wornFlowOutfit.id,
        editedOutfitId: syncFlowOutfit.id,
        deletedOutfitId: deleteFlowOutfit.id,
        standalonePieceId: standalonePiece.id,
        linkedPieceId,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
