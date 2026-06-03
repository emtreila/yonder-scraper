from requests_html import HTMLSession
from bs4 import BeautifulSoup

from .default_headers import DEFAULT_HEADERS


class GetDynamicSoup:
    def __new__(cls, link, custom_headers=None):

        session = HTMLSession()

        headers = DEFAULT_HEADERS.copy()

        if custom_headers:
            headers.update(custom_headers)

        response = session.get(link, headers=headers)

        response.html.render()

        return BeautifulSoup(response.html.html, 'lxml')
