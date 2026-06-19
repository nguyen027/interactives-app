import { useEffect, useState } from "react";

type CountdownProps = {
  seconds: number;
  size?: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
};

// Formats seconds into the M:SS display shown inside the timer.
function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// Runs the one-second countdown and renders the circular timer face.
function CountdownTimer({
  seconds,
  size = 112,
  color = "#ffffff",
  bgColor = "rgb(0 0 0 / 0.5)",
  borderColor = "rgb(255 255 255 / 0.8)",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const borderWidth = Math.max(Math.round(size / 28), 2);
  const fontSize = Math.max(Math.round(size / 3.7), 14);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  return (
    <div
      className="flex items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        borderWidth,
        fontSize,
        color,
        background: bgColor,
        borderColor,
      }}
    >
      {formatTime(timeLeft)}
    </div>
  );
}

// Remounts the timer whenever its initial seconds or size changes.
export default function Countdown(props: CountdownProps) {
  return (
    <CountdownTimer
      key={`${props.seconds}-${props.size}`}
      {...props}
    />
  );
}
