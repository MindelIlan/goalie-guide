import confetti from 'canvas-confetti';

export const celebrateCompletion = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50;

    confetti({
      particleCount,
      startVelocity: 30,
      spread: 360,
      origin: {
        x: randomInRange(0.1, 0.9),
        y: Math.random() - 0.2
      },
      colors: ['#F97316', '#0D9488', '#8B5CF6', '#D946EF', '#1EAEDB'],
      disableForReducedMotion: true
    });
  }, 250);
};