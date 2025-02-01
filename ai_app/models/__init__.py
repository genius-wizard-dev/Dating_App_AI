from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()

class Groq:
    def __init__(self):
        self._model_name = "llama3-groq-70b-8192-tool-use-preview"
        self._temperature = 0.0

    def llm(self):
        return ChatGroq(model_name=self._model_name, temperature=self._temperature)

    def llm_json_model(self):
        return ChatGroq(model_name=self._model_name, temperature=self._temperature, model_kwargs={"response_format": {"type": "json_object"}})


class ChatGPT:
    def __init__(self):
        self._model_name = "gpt-4o-mini"
        self._temperature = 0.0

    def llm(self):
        return ChatOpenAI(model_name=self._model_name, temperature=self._temperature)

    def llm_json_model(self):
        return ChatOpenAI(model_name=self._model_name, temperature=self._temperature, model_kwargs={"response_format": {"type": "json_object"}})
