import requests
import os
import json


class UpdateAPI:
    def __init__(self):
        self.post_url = 'https://api.laurentiumarian.ro/jobs/add/'
        self.logo_url = 'https://api.peviitor.ro/v1/logo/add/'

        self.post_header = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.get_token()}',
        }

        self.logo_header = {
            'Content-Type': 'application/json',
        }

    def get_token(self):
        token_endpoint = 'https://api.laurentiumarian.ro/get_token'
        email = os.environ.get('API_KEY')

        token = requests.post(token_endpoint, json={
            "email": email
        }, headers={
            "Content-Type": "application/json",
        })

        return token.json()['access']

    def update_jobs(self, company_name: str, data_jobs: list):
        post_request_to_server = requests.post(self.post_url, headers=self.post_header,
                                               data=json.dumps(data_jobs))

        file = company_name.lower() + '_scraper.py'
        data = {'data': len(data_jobs)}
        dataset_url = f'https://dev.laurentiumarian.ro/dataset/Scrapers_Matei/{file}/'
        requests.post(dataset_url, json=data)

        print(json.dumps(data_jobs, indent=4))
        if post_request_to_server.status_code == 200:
            print(f'Update ---> succesfuly added {len(data_jobs)} jobs')
        else:
            print(f'Update ---> failed {post_request_to_server}')

    def update_logo(self, id_company: str, logo_link: str):
        data = json.dumps([{"id": id_company, "logo": logo_link}])
        response = requests.post(
            self.logo_url, headers=self.logo_header, data=data)
