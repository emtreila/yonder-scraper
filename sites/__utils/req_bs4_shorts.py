import requests
from bs4 import BeautifulSoup
from .default_headers import DEFAULT_HEADERS
import xml.etree.ElementTree as ET


session = requests.Session()


class GetStaticSoup:
    def __new__(cls, link, custom_headers=None):
        headers = DEFAULT_HEADERS.copy()

        if custom_headers:
            headers.update(custom_headers)

        response = session.get(link, headers=headers)

        return BeautifulSoup(response.text, 'lxml')


class GetRequestJson:
    def __new__(cls, link, custom_headers=None):

        headers = DEFAULT_HEADERS.copy()

        if custom_headers:
            headers.update(custom_headers)

        response = session.get(link, headers=headers)

        try:
            json_response = response.json()
            return json_response
        except ValueError:
            return BeautifulSoup(response.text, 'lxml')
        finally:
            response.close()


class PostRequestJson:
    def __new__(cls, url, custom_headers=None, data_raw=None):
        headers = DEFAULT_HEADERS.copy()

        if custom_headers:
            headers.update(custom_headers)

        response = session.post(url, headers=headers, data=data_raw)

        try:
            return response.json()
        except ValueError:
            return BeautifulSoup(response.text, 'lxml')
        finally:
            response.close()


class GetHtmlSoup:
    def __new__(cls, html_response):
        return BeautifulSoup(html_response, 'lxml')


class GetHeadersDict:
    def __new__(cls, url, custom_headers=None):
        headers = DEFAULT_HEADERS.copy()

        if custom_headers:
            headers.update(custom_headers)

        response = session.head(url, headers=headers).headers

        return response


class GetXMLObject:
    def __new__(cls, url, custom_headers=None):
        headers = DEFAULT_HEADERS.copy()

        if custom_headers:
            headers.update(custom_headers)

        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return ET.fromstring(response.text)
