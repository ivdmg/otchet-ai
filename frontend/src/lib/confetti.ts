import confetti from "canvas-confetti";

export const triggerSuccessConfetti = () => {
  // Firework burst 1
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#6366F1", "#8B5CF6", "#10B981", "#F59E0B", "#3B82F6"],
  });

  // Side cannons burst 2 after short delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#6366F1", "#A855F7", "#3B82F6"],
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#10B981", "#F59E0B", "#6366F1"],
    });
  }, 250);
};
