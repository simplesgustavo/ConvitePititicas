"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import classNames from "classnames";

type VideoBackdropProps = {
  videoUrl: string | null;
  fallbackUrl: string | null;
  className?: string;
};

export default function VideoBackdrop({ videoUrl, fallbackUrl, className }: VideoBackdropProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;
    setIsVideoReady(false);
  }, [videoUrl]);

  if (!videoUrl && fallbackUrl) {
    return (
    <Image alt="Fundo do convite" className="fixed inset-0 z-0 h-full w-full object-cover" fill priority src={fallbackUrl} />
    );
  }

  if (!videoUrl) {
    return null;
  }

  return (
    <>
      <video
        autoPlay
        className={classNames("background-video opacity-0 transition-opacity duration-700", className, {
          "opacity-100": isVideoReady
        })}
        loop
        muted
        playsInline
        poster={fallbackUrl ?? undefined}
        onCanPlay={() => setIsVideoReady(true)}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      {fallbackUrl ? (
        <Image
          alt="Fundo do convite"
          className={classNames("fixed inset-0 z-0 h-full w-full object-cover transition-opacity duration-700", {
            "opacity-0": isVideoReady
          })}
          fill
          priority
          src={fallbackUrl}
        />
      ) : null}
    </>
  );
}
