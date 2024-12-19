" Script de download dos arquivos do mediafire pelo arquivo excel "

import urllib.parse
import os

import pandas as pd
import requests
import cloudscraper
import fitz  # PyMuPDF
from dotenv import load_dotenv
from openai import OpenAI

from conexao_cloud import ConexaoCloud
from conexao_banco import ConexaoBanco

load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_SECRET_KEY")
VECTOR_STORE_ID = "vs_iQANbqxbwAs574Hz3ajb45FR"
ASSISTANT_ID = "asst_c8ASgOrDsBBWNtBDq0ianqpL"
PASTA_SCRIPTS = "python-scripts"
PASTA_FILES = f"{PASTA_SCRIPTS}/files"
PASTA_PREVIEWS = f"{PASTA_SCRIPTS}/previews"
CHAVE_ACESSO = f"{PASTA_SCRIPTS}/chave.json"
DAYS_EXPIRE = 100
file_ids = []

extensoes = ["pdf", "doc", "docx"]


def baixa_video(x):
    "Função que percorre Data Frame e baixa arquivos pelos links"
    if len(file_ids) > 50:
        return
    url = x["Link MediaFire"]
    if pd.isnull(url):
        return

    file_name = urllib.parse.unquote(url.split("/")[-1])

    redirect = False
    if file_name == "file":
        file_name = urllib.parse.unquote(url.split("/")[-2])
        redirect = True

    extensao = file_name.split(".")[-1]

    if extensao not in extensoes:
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

    preview_name = f'{file_name.split(".")[0]}_preview.png'
    preview_path = f"{PASTA_PREVIEWS}/{preview_name}"

    try:
        pdf_document = fitz.open(converted_path)
        page = pdf_document[0]  # Get the first page

        # Get page dimensions (width and height)
        page_width = page.rect.width
        page_height = page.rect.height

        # Define the crop rectangle: top 1/4 of the page (x0, y0, x1, y1)
        crop_rect = fitz.Rect(0, 0, page_width, page_height / 3)

        # Apply the crop to the page
        page.set_cropbox(crop_rect)

        scale_x = 612 / page.rect.width
        # Height is cropped to 1/4 of the page
        scale_y = 264 / (page.rect.height)

        matrix = fitz.Matrix(scale_x, scale_y)
        # svg_content = page.get_svg_image()
        # with open(preview_path, "w") as svg_file:
        #     svg_file.write(svg_content)
        pix = page.get_pixmap(matrix=matrix)

        pix.save(preview_path)

    except Exception as ex:
        print(ex)
        return

    # Upload de arquivos para o storage
    blob_name = f"previews/{preview_name}"
    inst_cloud.upload_blob(blob_name, preview_path)
    preview_url = inst_cloud.gera_link_autenticado(blob_name, DAYS_EXPIRE)

    blob_name = f"files/{file_name}"
    inst_cloud.upload_blob(blob_name, converted_path)

    with open(converted_path, "rb") as file:
        uploaded_file = inst_openai.files.create(
            file=file, purpose="assistants")

    id_file = uploaded_file.id
    file_ids.append(id_file)

    file_no_extension = file_name.split(".")[0]
    display_name = (
        file_no_extension.split("_")[0]
        if len(file_no_extension.split("_")[0]) > 3
        else file_no_extension.split("_")[1]
    )
    registro = {
        "fileId": id_file,
        "downloadURL": url,
        "displayName": display_name,
        "previewImageURL": preview_url,
    }
    inst_mongo.insere_arquivos(registro)


if __name__ == "__main__":
    if not os.path.exists(PASTA_FILES):
        os.makedirs(PASTA_FILES)
    if not os.path.exists(PASTA_PREVIEWS):
        os.makedirs(PASTA_PREVIEWS)

    inst_openai = OpenAI(api_key=OPENAI_KEY)
    inst_cloud = ConexaoCloud(CHAVE_ACESSO)
    inst_mongo = ConexaoBanco()

    df = pd.read_excel(
        f"{PASTA_SCRIPTS}/planilhas/FY24 Resources Metrics Tracker.xlsx", header=1
    )

    df.apply(baixa_video, axis=1)

    print(file_ids)
    batch_add = inst_openai.beta.vector_stores.file_batches.create(
        vector_store_id=VECTOR_STORE_ID, file_ids=file_ids
    )
