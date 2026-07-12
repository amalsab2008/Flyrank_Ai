class ScheduleService {
  constructor(jobService, reportService, intervalMs = null) {
    this.jobService = jobService;
    this.reportService = reportService;
    this.intervalMs = intervalMs;
    this.timerId = null;
  }

  start() {
    if (!this.intervalMs || this.intervalMs <= 0) {
      console.log("[ScheduleService] No valid interval configured. Scheduled PDF generation disabled.");
      return;
    }

    console.log(`[ScheduleService] Scheduled PDF generation enabled. Running every ${this.intervalMs}ms.`);

    // Run the scheduler loop
    this.timerId = setInterval(async () => {
      console.log("[ScheduleService] Running scheduled PDF generation...");
      try {
        const job = await this.jobService.createJob("scheduled_pdf_report");
        this.jobService.runBackgroundJob(job.id, (updateProgress) => {
          return this.reportService.generatePdfReport(job.id, updateProgress);
        });
        console.log(`[ScheduleService] Spawned scheduled job ID: ${job.id}`);
      } catch (err) {
        console.error("[ScheduleService] Failed to trigger scheduled job:", err);
      }
    }, this.intervalMs);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log("[ScheduleService] Scheduled PDF generation stopped.");
    }
  }
}

module.exports = ScheduleService;
