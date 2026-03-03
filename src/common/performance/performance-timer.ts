export class PerformanceTimer {
  private readonly startTime: bigint;

  constructor() {
    this.startTime = process.hrtime.bigint();
  }

  stop(): number {
    const end = process.hrtime.bigint();
    const durationNs = end - this.startTime;
    return Number(durationNs) / 1_000_000;
  }
}