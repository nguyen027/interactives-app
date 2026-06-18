import { useEffect, useState } from "react";

type CountdownProps = {
  seconds: number;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function CountdownTimer({ seconds }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/80 bg-black/50 text-3xl font-bold text-white">
      {formatTime(timeLeft)}
    </div>
  );
}

export default function Countdown({ seconds }: CountdownProps) {
  return <CountdownTimer key={seconds} seconds={seconds} />;
}
