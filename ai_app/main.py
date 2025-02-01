from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from workflow import Flow
from database import RedisStore
from datetime import datetime
from pydantic import BaseModel
app = FastAPI()
# store = RedisStore()
# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả các domain truy cập (có thể thay thế bằng danh sách domain cụ thể)
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức HTTP (GET, POST, PUT, DELETE, v.v...)
    allow_headers=["*"],  # Cho phép tất cả các headers
)

flow = Flow()

class ChatRequest(BaseModel):
    question: str
    chat_id: str
    profile_id: str


@app.get("/")
async def root():
    print(flow.get_graph())
    return {"message": "Hello World"}

@app.post("/mobile/chat")
async def chat(request: ChatRequest):
    result = flow.run(request.question, request.chat_id, request.profile_id)
    final_result = {
        "result": result.get("final_generation", ""),
        "error": result.get("error", None)
    }
    return final_result


# @app.get("/mobile/chat/{profile_id}")
# def get_history(profile_id: str):
#     return store.get_history(f"chat:{profile_id}")
#
#
# @app.delete("/mobile/chat/{profile_id}")
# def delete_history(profile_id: str):
#     return store.delete_chat(f"chat:{profile_id}")