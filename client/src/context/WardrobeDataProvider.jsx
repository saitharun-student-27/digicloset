import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  createClothingItem,
  deleteClothingItem,
  getClothingItems,
  updateClothingItem,
} from "../services/clothingService";
import {
  createOutfit,
  deleteOutfit as deleteOutfitRequest,
  getOutfit,
  getOutfits,
  markOutfitWorn as markOutfitWornRequest,
  toggleFavoriteOutfit,
  updateOutfit as updateOutfitRequest,
} from "../services/outfitService";
import { useAuth } from "./AuthContext.jsx";

const WardrobeDataContext = createContext(null);

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.detail || fallbackMessage;
}

function updatePendingMap(currentMap, id, delta) {
  const nextCount = Math.max(0, (currentMap[id] || 0) + delta);
  const nextMap = { ...currentMap };

  if (nextCount === 0) {
    delete nextMap[id];
  } else {
    nextMap[id] = nextCount;
  }

  return nextMap;
}

export function WardrobeDataProvider({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [outfits, setOutfits] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [outfitsLoading, setOutfitsLoading] = useState(false);
  const [clothingLoading, setClothingLoading] = useState(false);
  const [outfitsError, setOutfitsError] = useState("");
  const [clothingError, setClothingError] = useState("");
  const [pendingOutfitMap, setPendingOutfitMap] = useState({});
  const [pendingPieceMap, setPendingPieceMap] = useState({});

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setOutfits([]);
      setClothingItems([]);
      setOutfitsError("");
      setClothingError("");
      setOutfitsLoading(false);
      setClothingLoading(false);
      setPendingOutfitMap({});
      setPendingPieceMap({});
      return;
    }

    refreshAll().catch(() => {});
  }, [isAuthenticated, isAuthLoading]);

  async function fetchOutfits({ withLoading = true } = {}) {
    if (withLoading) {
      setOutfitsLoading(true);
    }
    setOutfitsError("");

    try {
      const data = await getOutfits();
      setOutfits(data);
      return data;
    } catch (error) {
      if (error?.response?.status === 401) {
        setOutfits([]);
        return [];
      }
      const message = getErrorMessage(
        error,
        "Could not load outfit memories right now.",
      );
      setOutfitsError(message);
      throw error;
    } finally {
      if (withLoading) {
        setOutfitsLoading(false);
      }
    }
  }

  async function fetchClothing({ withLoading = true } = {}) {
    if (withLoading) {
      setClothingLoading(true);
    }
    setClothingError("");

    try {
      const data = await getClothingItems();
      setClothingItems(data);
      return data;
    } catch (error) {
      if (error?.response?.status === 401) {
        setClothingItems([]);
        return [];
      }
      const message = getErrorMessage(
        error,
        "Could not load wardrobe pieces right now.",
      );
      setClothingError(message);
      throw error;
    } finally {
      if (withLoading) {
        setClothingLoading(false);
      }
    }
  }

  function upsertOutfitItem(outfit) {
    if (!outfit?.id) {
      return;
    }

    setOutfits((current) => {
      const exists = current.some((entry) => entry.id === outfit.id);

      if (!exists) {
        return [outfit, ...current];
      }

      return current.map((entry) =>
        entry.id === outfit.id ? { ...entry, ...outfit } : entry,
      );
    });
  }

  async function refreshOutfits() {
    return fetchOutfits({ withLoading: true });
  }

  async function refreshClothing() {
    return fetchClothing({ withLoading: true });
  }

  async function refreshAll() {
    const [outfitsResult, clothingResult] = await Promise.allSettled([
      refreshOutfits(),
      refreshClothing(),
    ]);

    if (
      outfitsResult.status === "rejected" &&
      clothingResult.status === "rejected"
    ) {
      throw outfitsResult.reason || clothingResult.reason;
    }
  }

  function beginOutfitMutation(id) {
    setPendingOutfitMap((current) => updatePendingMap(current, id, 1));
  }

  function finishOutfitMutation(id) {
    setPendingOutfitMap((current) => updatePendingMap(current, id, -1));
  }

  function beginPieceMutation(id) {
    setPendingPieceMap((current) => updatePendingMap(current, id, 1));
  }

  function finishPieceMutation(id) {
    setPendingPieceMap((current) => updatePendingMap(current, id, -1));
  }

  async function createOutfitMemory(payload) {
    const createdOutfit = await createOutfit(payload);

    if (createdOutfit?.id) {
      upsertOutfitItem(createdOutfit);
    } else {
      await refreshOutfits();
    }

    fetchOutfits({ withLoading: false }).catch(() => {});
    fetchClothing({ withLoading: false }).catch(() => {});
    return createdOutfit;
  }

  async function favoriteOutfit(outfitId) {
    const previousOutfits = outfits;
    beginOutfitMutation(outfitId);

    setOutfits((current) =>
      current.map((outfit) =>
        outfit.id === outfitId
          ? { ...outfit, is_favorite: !outfit.is_favorite }
          : outfit,
      ),
    );

    try {
      const response = await toggleFavoriteOutfit(outfitId);
      const updatedOutfit = response?.id ? response : response?.outfit;

      if (updatedOutfit?.id) {
        upsertOutfitItem(updatedOutfit);
      }

      fetchOutfits({ withLoading: false }).catch(() => {});
      return response;
    } catch (error) {
      setOutfits(previousOutfits);
      throw error;
    } finally {
      finishOutfitMutation(outfitId);
    }
  }

  async function markOutfitWorn(outfitId) {
    const previousOutfits = outfits;
    const optimisticDate = new Date().toISOString();
    beginOutfitMutation(outfitId);

    setOutfits((current) =>
      current.map((outfit) =>
        outfit.id === outfitId
          ? { ...outfit, last_worn_date: optimisticDate }
          : outfit,
      ),
    );

    try {
      const response = await markOutfitWornRequest(outfitId);
      const updatedOutfit = response?.id ? response : response?.outfit;

      if (updatedOutfit?.id) {
        upsertOutfitItem(updatedOutfit);
      }

      fetchOutfits({ withLoading: false }).catch(() => {});
      return response;
    } catch (error) {
      setOutfits(previousOutfits);
      throw error;
    } finally {
      finishOutfitMutation(outfitId);
    }
  }

  async function saveOutfit(outfitId, payload) {
    const previousOutfits = outfits;
    beginOutfitMutation(outfitId);

    setOutfits((current) =>
      current.map((outfit) =>
        outfit.id === outfitId ? { ...outfit, ...payload } : outfit,
      ),
    );

    try {
      const response = await updateOutfitRequest(outfitId, payload);
      const updatedOutfit = response?.id ? response : response?.outfit;

      if (updatedOutfit?.id) {
        upsertOutfitItem(updatedOutfit);
      }

      fetchOutfits({ withLoading: false }).catch(() => {});
      return response;
    } catch (error) {
      setOutfits(previousOutfits);
      throw error;
    } finally {
      finishOutfitMutation(outfitId);
    }
  }

  async function removeOutfit(outfitId) {
    const previousOutfits = outfits;
    beginOutfitMutation(outfitId);

    setOutfits((current) => current.filter((outfit) => outfit.id !== outfitId));

    try {
      const response = await deleteOutfitRequest(outfitId);
      fetchOutfits({ withLoading: false }).catch(() => {});
      return response;
    } catch (error) {
      setOutfits(previousOutfits);
      throw error;
    } finally {
      finishOutfitMutation(outfitId);
    }
  }

  async function createPiece(data) {
    const createdPiece = await createClothingItem(data);

    if (createdPiece?.id) {
      setClothingItems((current) => [createdPiece, ...current]);
    } else {
      await refreshClothing();
    }

    fetchClothing({ withLoading: false }).catch(() => {});
    return createdPiece;
  }

  async function savePiece(pieceId, payload) {
    const previousPieces = clothingItems;
    beginPieceMutation(pieceId);

    setClothingItems((current) =>
      current.map((item) => (item.id === pieceId ? { ...item, ...payload } : item)),
    );

    try {
      const response = await updateClothingItem(pieceId, payload);
      const updatedPiece = response?.id ? response : response?.item;

      if (updatedPiece?.id) {
        setClothingItems((current) =>
          current.map((item) =>
            item.id === pieceId ? { ...item, ...updatedPiece } : item,
          ),
        );
      }

      fetchClothing({ withLoading: false }).catch(() => {});
      return response;
    } catch (error) {
      setClothingItems(previousPieces);
      throw error;
    } finally {
      finishPieceMutation(pieceId);
    }
  }

  async function removePiece(pieceId) {
    const previousPieces = clothingItems;
    beginPieceMutation(pieceId);

    setClothingItems((current) => current.filter((item) => item.id !== pieceId));

    try {
      const response = await deleteClothingItem(pieceId);
      fetchClothing({ withLoading: false }).catch(() => {});
      return response;
    } catch (error) {
      setClothingItems(previousPieces);
      throw error;
    } finally {
      finishPieceMutation(pieceId);
    }
  }

  function getOutfitById(outfitId) {
    return outfits.find((outfit) => outfit.id === outfitId) || null;
  }

  async function fetchOutfitById(outfitId) {
    beginOutfitMutation(outfitId);

    try {
      const outfit = await getOutfit(outfitId);
      upsertOutfitItem(outfit);
      return outfit;
    } finally {
      finishOutfitMutation(outfitId);
    }
  }

  const value = useMemo(
    () => ({
      outfits,
      clothingItems,
      outfitsLoading,
      clothingLoading,
      outfitsError,
      clothingError,
      refreshOutfits,
      refreshClothing,
      refreshAll,
      getOutfitById,
      fetchOutfitById,
      createOutfit: createOutfitMemory,
      favoriteOutfit,
      markOutfitWorn,
      updateOutfit: saveOutfit,
      deleteOutfit: removeOutfit,
      createPiece,
      updatePiece: savePiece,
      deletePiece: removePiece,
      isOutfitPending: (outfitId) => Boolean(pendingOutfitMap[outfitId]),
      isPiecePending: (pieceId) => Boolean(pendingPieceMap[pieceId]),
    }),
    [
      outfits,
      clothingItems,
      outfitsLoading,
      clothingLoading,
      outfitsError,
      clothingError,
      pendingOutfitMap,
      pendingPieceMap,
    ],
  );

  return (
    <WardrobeDataContext.Provider value={value}>
      {children}
    </WardrobeDataContext.Provider>
  );
}

export function useWardrobeData() {
  const context = useContext(WardrobeDataContext);

  if (!context) {
    throw new Error("useWardrobeData must be used within WardrobeDataProvider.");
  }

  return context;
}
