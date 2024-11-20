"""
Órbita Engenharia Integrada

Classe para acessar o google cloud storage

Criado em: 20/10/2020
"""
from google.cloud import storage
from google.cloud.storage import Blob
from datetime import datetime, timedelta
import requests


class ConexaoCloud:

    """Faz conexao com o google cloud storage"""

    def __init__(self, chave, bucket_name=None, test=False):
        if not bucket_name:
            if test:
                bucket_name = 'gpt-assistant-imgs'
            else:
                bucket_name = 'gpt-assistant-imgs'
        self.storage_client = storage.Client.from_service_account_json(chave)
        self.bucket_connection = self.storage_client.get_bucket(
            bucket_name, timeout=10)
        # print(f"Instancia google cloud storage criada: {bucket_name}")

    def close_connection(self):
        """ Finaliza storage client"""
        self.storage_client.close()

    def upload_blob(self, blob_name, local_file):
        """Downloads a blob from the bucket."""
        try:
            blob = self.bucket_connection.blob(blob_name)
            blob.upload_from_filename(local_file)
            print(f'Arquivo enviado: {local_file}')
            return True
        except Exception as ex:
            print(f"Erro ao enviar {blob_name}. {ex}")
            return False

    def download_blob(self, blob_name, destination_file_name):
        """Downloads a blob from the bucket."""
        try:
            blob = self.bucket_connection.blob(blob_name)
            blob.download_to_filename(destination_file_name)
            print(f"Baixado: {destination_file_name}")
            return True
        except Exception as ex:
            print(f"Erro ao baixar {blob_name}. {ex}")
            return False

    def gera_link_autenticado(self, blob_name, days_expire):
        """Gera link de uma imagem existente no google cloud
        :param blob_name: caminho no cloud
        :param expires: datetime de quando vence o link (obrigatório)"""
        try:
            blob = self.bucket_connection.blob(blob_name)
            expires = datetime.now() + timedelta(days=days_expire)
            link = blob.generate_signed_url(expiration=expires)
            # print(f"Link gerado: {link}")
            return link
        except Exception as ad:
            print(
                f'Erro ao gerar link autenticado de: {blob_name}. {ad}')
            return blob_name

    def checa_existencia(self, blob_name):
        try:
            blob = self.bucket_connection.blob(blob_name)
            exists = blob.exists()
            if exists:
                return True
            return False
        except Exception as ad:
            print(
                f'Erro ao checar existencia de: {blob_name}. {ad}')
            return False

    def checa_existencia_trimble(self, folder):
        try:
            blobs = self.bucket_connection.list_blobs(prefix=folder)
            for blob in blobs:  # Se tem algum arquivo retorna True
                return blob.name
            return False
        except Exception as ad:
            print(f'Erro ao checar existencia de: {folder}. {ad}')
            return False

    def list_blobs(self, prefixo="", ext="", substrings: list = None):
        """Retorna a listagem de dados
            Padrão de arquivo:
            prefixo: string inicial, path ou parte do arquivo.
            ext: lista de extensões do arquivo. Ex: ['.mp4', '.json']
            Retorno: lista, dicionario"""
        try:
            file_list = []
            blobs = self.bucket_connection.list_blobs(
                prefix=prefixo, timeout=100)
            for blob in blobs:
                name = str(blob.name)
                name_split = name.split("/")
                file_name = name_split[-1]
                file_ext = file_name.split(".")[-1]
                # Verifica extencao do arquivo
                if ext and file_ext != ext:
                    continue
                # Verifica uma substring no nome do arquivo
                if substrings:
                    has_substring = False
                    for substring in substrings:
                        if substring in name:
                            has_substring = True
                            break
                    if not has_substring:
                        continue
                file_list.append(blob)
            # Ordena por nome (data)

            def get_sort_key(obj):
                return obj.name
            sorted_files = sorted(file_list, key=get_sort_key)
            return sorted_files
        except Exception as ex:
            print(f"Erro ao listar arquivos do GCP storage. {ex}")
            return None

    def read_blob_json(self, blob: Blob):
        """ Le arquivo json diretamente do GCP """
        try:
            expires = datetime.now() + timedelta(hours=6)
            link = blob.generate_signed_url(expiration=expires)
            conteudo_json = requests.get(link, timeout=60).json()
            return conteudo_json
        except Exception as ex:
            print(f"Erro ao ler arquivo {blob.name}. {ex}")
            return None
