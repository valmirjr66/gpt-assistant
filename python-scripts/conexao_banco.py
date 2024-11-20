" Código central com as funções relacionadas ao banco mongoDB"
import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_CONNECTION = os.getenv('DATABASE_URL')


class ConexaoBanco():
    " Objeto do banco de dados "

    def __init__(self):
        client = MongoClient(MONGO_CONNECTION)
        self.mydb = client["cluster0"]

    def insere_arquivos(self, pac):
        collection = self.mydb["FileReference"]
        result = collection.insert_one(pac)
        print(result)
        return
