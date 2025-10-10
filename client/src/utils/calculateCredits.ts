import { CREDIT_COSTS, DAILY_CREDIT_ALLOCATION } from './constants';

// Re-export for convenience
export { CREDIT_COSTS, DAILY_CREDIT_ALLOCATION };

export function canAfford(currentCredits: number, action: keyof typeof CREDIT_COSTS): boolean {
  return currentCredits >= CREDIT_COSTS[action];
}

export function getTimeUntilRefresh(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function maskName(name: string): string {
  if (name.length <= 2) return name;
  return name[0] + '***' + name[name.length - 1];
}

