" Script de download dos arquivos do mediafire pelo arquivo excel "

import urllib.parse
import os

import pandas as pd
import requests
import cloudscraper


def baixa_video(x):
    "Função que percorre Data Frame e baixa arquivos pelos links"

    url = x["Link MediaFire"]
    if pd.isnull(url):
        return

    file_name = urllib.parse.unquote(url.split("/")[-1])

    redirect = False
    if file_name == "file":
        file_name = urllib.parse.unquote(url.split("/")[-2])
        redirect = True

    if not redirect:
        return

    if redirect:
        scraper = cloudscraper.create_scraper()
        response = scraper.get(url)
    else:
        response = requests.get(url, timeout=30)

    if "." not in file_name:
        return
    converted_path = f"{PASTA_FILES}/{file_name}"

    with open(converted_path, "wb") as f:
        f.write(response.content)


PASTA_SCRIPTS = "python-scripts"
PASTA_FILES = f"{PASTA_SCRIPTS}/files"

if not os.path.exists(PASTA_FILES):
    os.makedirs(PASTA_FILES)

df = pd.read_excel(
    f"{PASTA_SCRIPTS}/planilhas/FY24 Resources Metrics Tracker.xlsx", header=1
)

df.apply(baixa_video, axis=1)


# exit()

# url = (
#     "https://www.mediafire.com/file/2w1uiyif5e8x8he/FilmingthePolice_USA_V3_1.pdf/file"
# )

# response = requests.get(url, allow_redirects=True)
# print(response)
# print(response.text)
# exit()

# scraper = cloudscraper.create_scraper()

# # Step 1: Send a request to the MediaFire link
# response = scraper.get(url)
# file_name = urllib.parse.unquote(url.split("/")[-1])
# file_name = "teste.pdf"
# print(file_name)
# converted_path = f"python-scripts/files/{file_name}"

# with open(converted_path, "wb") as f:
#     f.write(response.content)
