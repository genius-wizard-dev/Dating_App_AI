from dotenv import load_dotenv
import os
from langchain_redis import RedisConfig, RedisVectorStore
from redis import Redis
from langchain_openai import OpenAIEmbeddings
from supabase import create_client
from supabase.lib.client_options import  ClientOptions
load_dotenv()

class RedisStore:
    def __init__(self):
        self.redis = Redis(
            host=os.getenv('REDIS_HOST'),
            port=os.getenv('REDIS_PORT'),
            password=os.getenv('REDIS_PASSWORD'),
        )
        self._embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        self._config = RedisConfig(index_name="dating_app", redis_client=self.redis)
        self.store = RedisVectorStore(self._embeddings, self._config)

    def as_retriver(self):
        return self.store.as_retriever(search_kwargs={"k": 3})

    def get_history(self, chat_id: str) -> str:
        return self.redis.json().get(chat_id)

    def save_history(self, chat_id: str, question: str, answer: str) -> None:
        chat_history = self.get_history(chat_id)
        if not chat_history:
            chat_history = []
        chat_history.append({"question": question, "answer": answer})
        self.redis.json().set(chat_id, "$", chat_history)


    def delete_chat(self, chat_id: str) -> None:
        return self.redis.delete(chat_id)

class SupabaseStore:
    def __init__(self):
        self._url: str = os.getenv("SUPABASE_URL")
        self._key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self._supabase = create_client(
          self._url,
          self._key,
          options=ClientOptions(auto_refresh_token=False, persist_session=False)
        )

    def get_client(self):
        return self._supabase






