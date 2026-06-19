type MediaBackgroundProps = {
  image?: string;
  video?: string;
};

// Renders a simple full-screen media background from legacy image/video props.
export default function MediaBackground({ image, video }: MediaBackgroundProps) {
  if (video) {
    return (
      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return <div className="absolute inset-0 bg-zinc-950" />;
}
