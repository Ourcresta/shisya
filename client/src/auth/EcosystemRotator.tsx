import { useState } from "react";
import shikshaSeal from "@assets/image_1766511184194.png";
import udyogSeal from "@assets/image_1771923592033.png";
import ushaAvatar from "@/assets/images/usha-avatar.png";

const faces = [
  { src: shikshaSeal, alt: "Our Shiksha - Learning Platform", label: "Our Shiksha" },
  { src: ushaAvatar, alt: "Usha - AI Mentor", label: "Usha AI" },
  { src: udyogSeal, alt: "Our Udyog - Industry Placement", label: "Our Udyog" },
];

export default function EcosystemRotator() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="eco-rotator"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="ecosystem-rotator"
    >
      <div className="eco-rotator__glow" />
      <div className="eco-rotator__aura" />

      <div className="eco-rotator__scene">
        <div
          className={`eco-rotator__carousel ${isPaused ? "eco-rotator__carousel--paused" : ""}`}
        >
          {faces.map((face, i) => (
            <div
              key={i}
              className={`eco-rotator__face eco-rotator__face--${i + 1}`}
            >
              <div className="eco-rotator__face-inner">
                <img
                  src={face.src}
                  alt={face.alt}
                  className="eco-rotator__image"
                  loading="eager"
                  draggable={false}
                />
              </div>
              <span className="eco-rotator__label">{face.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`eco-rotator__shadow ${isPaused ? "eco-rotator__shadow--paused" : ""}`} />

      <div className="eco-rotator__ring" />
    </div>
  );
}
