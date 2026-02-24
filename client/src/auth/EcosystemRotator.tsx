import { useState, useEffect, useRef, useCallback } from "react";
import shikshaCoin from "@assets/image_1771941689932.png";
import udyogCoin from "@assets/image_1771941747918.png";
import ushaCoin from "@assets/image_1771941793408.png";

const ROTATION_MS = 4000;
const allFaces = [shikshaCoin, ushaCoin, udyogCoin];

export default function EcosystemRotator() {
  const [frontSrc, setFrontSrc] = useState(allFaces[0]);
  const [backSrc, setBackSrc] = useState(allFaces[1]);
  const nextIdx = useRef(2);
  const swapTarget = useRef<"front" | "back">("front");

  const doSwap = useCallback(() => {
    const img = allFaces[nextIdx.current % allFaces.length];
    if (swapTarget.current === "front") {
      setFrontSrc(img);
      swapTarget.current = "back";
    } else {
      setBackSrc(img);
      swapTarget.current = "front";
    }
    nextIdx.current += 1;
  }, []);

  useEffect(() => {
    const halfRotation = ROTATION_MS / 2;
    const firstDelay = ROTATION_MS / 4;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const firstTimer = setTimeout(() => {
      doSwap();
      intervalId = setInterval(doSwap, halfRotation);
    }, firstDelay);

    return () => {
      clearTimeout(firstTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [doSwap]);

  return (
    <div className="coin3d" data-testid="ecosystem-rotator">
      <div className="coin3d__scene">
        <div className="coin3d__body coin3d__body--spinning">
          <div className="coin3d__face coin3d__face--front">
            <img src={frontSrc} alt="Coin face" draggable={false} />
          </div>
          <div className="coin3d__face coin3d__face--back">
            <img src={backSrc} alt="Coin face" draggable={false} />
          </div>
        </div>
      </div>
      <div className="coin3d__shadow" />
    </div>
  );
}
