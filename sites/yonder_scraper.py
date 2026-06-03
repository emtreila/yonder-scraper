# Company ---> Yonder
# Link ------> https://tss-yonder.com/job

from __utils import (
    GetStaticSoup,
    get_county,
    get_job_type,
    Item,
    UpdateAPI,
)


def scraper():

    job_list = []
    url = "https://tss-yonder.com/job"

    soup = GetStaticSoup(url)
    jobs_container = soup.find('ul', id='jobs-list')

    if not jobs_container:
        return job_list

    for job in jobs_container.find_all('li'):
        link_tag = job.find('a')
        if not link_tag:
            continue

        job_link = link_tag.get('href', '')
        seniority = link_tag.find('span', class_='super')
        title = link_tag.find('span', class_='main')
        location = link_tag.find('span', class_='sub')

        if seniority and title and location:
            job_title = f"{seniority.text.strip()} {title.text.strip()}"
            city = location.text.strip()
            county = get_county(city) if city != "Romania (Remote)" else ""

            remote = 'remote' if 'Remote' in city else 'on-site'

            job_list.append(Item(
                job_title=job_title,
                job_link=job_link,
                company='Yonder',
                country='Romania',
                county=county,
                city=city,
                remote=remote,
            ).to_dict())

    return job_list


def main():

    company_name = "Yonder"
    logo_link = "https://tss-yonder.com/wp-content/themes/yonder/assets/images/logo.svg"

    jobs = scraper()

    # uncomment if your scraper done
    # UpdateAPI().update_jobs(company_name, jobs)
    # UpdateAPI().update_logo(company_name, logo_link)

    print(f"Scraped {len(jobs)} jobs from Yonder")
    import json
    print(json.dumps(jobs, indent=4))


if __name__ == '__main__':
    main()
