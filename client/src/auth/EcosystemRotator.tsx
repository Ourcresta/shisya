import { useState, useEffect } from "react";
import shikshaCoin from "@assets/image_1771941689932.png";
import udyogCoin from "@assets/image_1771941747918.png";
import ushaCoin from "@assets/image_1771941793408.png";

const HOLD = 5000;
const FLIP = 900;

const sequence = [
  { front: ushaCoin, back: shikshaCoin },
  { front: ushaCoin, back: udyogCoin },
];

export default function EcosystemRotator() {
  const [angle, setAngle] = useState(0);
  const [step, setStep] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [showingBack, setShowingBack] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function tick() {
      if (!showingBack) {
        setFlipping(true);
        setAngle(180);
        timeout = setTimeout(() => {
          setFlipping(false);
          setShowingBack(true);
          timeout = setTimeout(() => {
            setFlipping(true);
            setAngle(360);
            timeout = setTimeout(() => {
              setFlipping(false);
              setShowingBack(false);
              setAngle(0);
              setStep((s) => (s + 1) % sequence.length);
              timeout = setTimeout(tick, HOLD);
            }, FLIP);
          }, HOLD);
        }, FLIP);
      }
    }

    timeout = setTimeout(tick, HOLD);
    return () => clearTimeout(timeout);
  }, [step]);

  const pair = sequence[step];

  return (
    <div className="coin3d" data-testid="ecosystem-rotator">
      <div className="coin3d__glow" />
      <div className="coin3d__aura" />
      <div className="coin3d__scene">
        <div
          className="coin3d__body"
          style={{
            transform: `rotateY(${angle}deg)`,
            transition: flipping
              ? `transform ${FLIP}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : "none",
          }}
        >
          <div className="coin3d__face coin3d__face--front">
            <img src={pair.front} alt="Usha AI" draggable={false} />
          </div>
          <div className="coin3d__edge" />
          <div className="coin3d__face coin3d__face--back">
            <img src={pair.back} alt="Brand" draggable={false} />
          </div>
        </div>
      </div>
      <div className="coin3d__shadow" />
    </div>
  );
}
