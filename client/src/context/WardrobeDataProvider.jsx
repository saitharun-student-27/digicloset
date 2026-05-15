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
  getOutfits,
  markOutfitWorn as markOutfitWornRequest,
  toggleFavoriteOutfit,
  updateOutfit as updateOutfitRequest,
} from "../services/outfitService";

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
  const [outfits, setOutfits] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [clothingLoading, setClothingLoading] = useState(true);
  const [outfitsError, setOutfitsError] = useState("");
  const [clothingError, setClothingError] = useState("");
  const [pendingOutfitMap, setPendingOutfitMap] = useState({});
  const [pendingPieceMap, setPendingPieceMap] = useState({});

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshOutfits() {
    setOutfitsLoading(true);
    setOutfitsError("");

    try {
      const data = await getOutfits();
      setOutfits(data);
      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not load outfit memories right now.",
      );
      setOutfitsError(message);
      throw error;
    } finally {
      setOutfitsLoading(false);
    }
  }

  async function refreshClothing() {
    setClothingLoading(true);
    setClothingError("");

    try {
      const data = await getClothingItems();
      setClothingItems(data);
      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not load wardrobe pieces right now.",
      );
      setClothingError(message);
      throw error;
    } finally {
      setClothingLoading(false);
    }
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
      setOutfits((current) => [createdOutfit, ...current]);
    } else {
      await refreshOutfits();
    }

    refreshClothing().catch(() => {});
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
        setOutfits((current) =>
          current.map((outfit) =>
            outfit.id === outfitId ? { ...outfit, ...updatedOutfit } : outfit,
          ),
        );
      }

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
        setOutfits((current) =>
          current.map((outfit) =>
            outfit.id === outfitId ? { ...outfit, ...updatedOutfit } : outfit,
          ),
        );
      }

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
        setOutfits((current) =>
          current.map((outfit) =>
            outfit.id === outfitId ? { ...outfit, ...updatedOutfit } : outfit,
          ),
        );
      }

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
      return await deleteOutfitRequest(outfitId);
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
      return await deleteClothingItem(pieceId);
    } catch (error) {
      setClothingItems(previousPieces);
      throw error;
    } finally {
      finishPieceMutation(pieceId);
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
