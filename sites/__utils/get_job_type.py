def get_job_type(job_type: str) -> str:
    job_type = job_type.lower()

    if job_type == 'hybrid':
        return job_type
    elif job_type == 'remote':
        return job_type
    else:
        return 'on-site'
