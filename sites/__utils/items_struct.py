from dataclasses import dataclass
from typing import Union, List


@dataclass
class Item:
    job_title: str
    job_link: str
    company: str
    country: str
    county: Union[str, List[str]]
    city: Union[str, List[str]]
    remote: str

    def to_dict(self) -> dict:
        item_dict = {
            "job_title": self.job_title,
            "job_link": self.job_link,
            "company": self.company,
            "country": self.country,
            "county": self.county,
            "city": self.city,
            "remote": self.remote
        }
        return item_dict
