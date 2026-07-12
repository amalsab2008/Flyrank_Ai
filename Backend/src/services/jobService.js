class JobService {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async getJobs() {
    return await this.jobRepository.getAll();
  }

  async getJob(id) {
    return await this.jobRepository.getById(id);
  }

  async createJob(type) {
    return await this.jobRepository.create(type);
  }

  runBackgroundJob(jobId, workerFn) {
    // Run the background task without blocking the main event loop
    setImmediate(async () => {
      try {
        // Mark job as processing
        await this.jobRepository.update(jobId, { status: 'processing', progress: 0 });

        // Define a progress update helper
        const updateProgress = async (progress) => {
          // Keep progress bounded between 0 and 99 during processing
          const safeProgress = Math.max(0, Math.min(99, Math.round(progress)));
          await this.jobRepository.update(jobId, { progress: safeProgress });
        };

        // Run the actual job worker logic
        const result = await workerFn(updateProgress);

        // Mark as completed
        await this.jobRepository.update(jobId, {
          status: 'completed',
          progress: 100,
          result: result
        });
      } catch (err) {
        console.error(`[JobService] Background job ${jobId} failed:`, err);
        await this.jobRepository.update(jobId, {
          status: 'failed',
          error: err.message
        });
      }
    });
  }
}

module.exports = JobService;
