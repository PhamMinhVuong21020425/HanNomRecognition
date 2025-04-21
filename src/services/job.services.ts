import { AppDataSource } from '../config/data-source';
import { TrainingJob } from '../entities/training_job.entity';

const jobRepository = AppDataSource.getRepository(TrainingJob);

export const getJobById = async (id: string) => {
  const job = await jobRepository.findOneBy({ id });
  return job;
};

export const getJobsByUserId = async (userId: string) => {
  const jobs = await jobRepository.find({
    where: { user: { id: userId } },
    order: { completed_at: 'DESC', created_at: 'DESC' },
    relations: { model: true, dataset: true },
  });
  return jobs;
};

export const createJob = async (job: Partial<TrainingJob>) => {
  const newJob = jobRepository.create(job);
  return jobRepository.save(newJob);
};

export const updateJob = async (id: string, job: Partial<TrainingJob>) => {
  const currentJob = await getJobById(id);
  if (!currentJob) {
    return null;
  }
  Object.assign(currentJob, job);
  return jobRepository.save(currentJob);
};

export const deleteJobById = async (id: string) => {
  const result = await jobRepository.delete(id);
  return result.affected ? true : false;
};
