# from langchain_community.tools import BraveSearch
from dotenv import load_dotenv
import os
from langchain.schema.document import Document
import json
import requests
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from models import ChatGPT
from database import SupabaseStore
from langchain.schema.messages import HumanMessage
load_dotenv()
class WebSearch:
    def __init__(self):
        self._serper_api_key = os.getenv("SERPER_API_KEY")

    def serper_search(self, query: str, type_search: str):
        """
        Thực hiện tìm kiếm với Serper API và trả về kết quả dưới dạng Document của LangChain.

        Args:
            query (str): Câu truy vấn tìm kiếm.
            type_search (str): Loại tìm kiếm ("maps" hoặc "search").

        Returns:
            list[Document]: Danh sách tài liệu kết quả tìm kiếm.
        """
        url = f"https://google.serper.dev/{type_search}"
        payload = json.dumps({
            "q": query,
            "hl": "vi",
            "gl": "vn",
        })
        headers = {
            'X-API-KEY': self._serper_api_key,
            'Content-Type': 'application/json'
        }
        response = requests.request("POST", url, headers=headers, data=payload)

        if response.status_code == 200:
            response = response.json()
            documents = []

            if type_search.lower() == "maps":
                for item in response.get("places", []):
                    # Nội dung đầy đủ hơn bao gồm thông tin đánh giá, link nếu có
                    content = (
                        f"Tên địa điểm: {item['title']}\n"
                        f"Địa chỉ: {item['address']}\n"
                        f"Giờ làm việc: {item.get('openingHours', 'Không có thông tin giờ mở cửa')}\n"
                        f"Đánh giá: {item.get('rating', 'Không có đánh giá')} sao\n"
                        f"Số đánh giá: {item.get('reviewCount', 'Không rõ')}\n"
                        f"Link: {item.get('link', 'Không có đường dẫn')}."
                    )
                    metadata = {
                    }
                    documents.append(Document(page_content=content, metadata=metadata))
            else:
                answer = response.get("answerBox", {})
                if answer:
                    # Nội dung chi tiết cho kết quả tìm kiếm
                    content = (
                        f"Câu trả lời: {answer.get('snippet', 'Không có câu trả lời')}\n"
                        f"Tiêu đề: {answer.get('title', 'Không có tiêu đề')}\n"
                        f"Link: {answer.get('link', 'Không có đường dẫn')}\n"
                        f"Snippet nổi bật: {answer.get('snippetHighlighted', 'Không có thông tin')}"
                    )
                    metadata = {
                    }
                    documents.append(Document(page_content=content, metadata=metadata))

            return documents
        else:
            return []





class Chat:
    def __init__(self):
        self._client = SupabaseStore().get_client()

        @tool
        def get_user_info(profile_id: str):
            """Xem thông tin người dùng."""
            return self._client.table("profiles").select("*").eq("id", profile_id).execute()

        @tool
        def get_friends(profile_id: str):
            """Lấy thông tin chi tiết bạn bè."""
            try:
                # Truy vấn danh sách bạn bè từ bảng 'friends'
                friends_response = self._client.table("friends").select("friends").eq("profile_id",
                                                                                      profile_id).single().execute()

                friends = friends_response.data.get("friends", [])

                # Nếu không có bạn bè, trả về danh sách trống
                if not friends:
                    return []

                # Khởi tạo danh sách thông tin bạn bè
                friend_info_list = []

                # Lặp qua danh sách bạn bè và truy vấn thông tin từ bảng 'profiles'
                for friend_id in friends:
                    profile_response = self._client.table("profiles").select(
                        "id, full_name, avatar, age, gender, email").eq("id", friend_id).single().execute()

                    friend_info = profile_response.data
                    if friend_info:
                        friend_info['view_profile_link'] = f"nonegroup.io://profile/{friend_info['id']}?goBack=/chat"
                        friend_info_list.append(friend_info)

                return friend_info_list  # Trả về danh sách thông tin bạn bè

            except Exception as e:
                return {
                    "error": str(e)
                }

        @tool
        def get_friend_request(profile_id: str):
            """Lấy thông tin yêu cầu kết bạn và trả về kèm link của từng bạn bè."""
            try:
                # Truy vấn danh sách yêu cầu kết bạn từ bảng 'friend_request'
                friends_response = self._client.table("friend_request").select("sender_id").eq("receiver_id",
                                                                                               profile_id).execute()

                if not friends_response.data or len(friends_response.data) == 0:
                    return []

                friend_info_list = []
                # Lặp qua danh sách yêu cầu kết bạn và truy vấn thông tin từ bảng 'profiles'
                for dict_request in friends_response.data:
                    profile_response = self._client.table("profiles").select(
                        "id, full_name, avatar, age, gender, email").eq("id", dict_request.get(
                        "sender_id")).single().execute()

                    friend_info = profile_response.data
                    if friend_info:
                        # Tạo URL với friend id
                        friend_info['view_profile_link'] = f"nonegroup.io://profile/{friend_info['id']}?goBack=/chat"  # Thêm tham số goBack vào URL
                        friend_info_list.append(friend_info)

                return friend_info_list  # Trả về danh sách thông tin bạn bè, mỗi bạn bè có kèm link

            except Exception as e:
                return {
                    "error": str(e)
                }

        self._tools = [get_user_info, get_friends, get_friend_request]
        self._tool_node = ToolNode(self._tools)


        self._model = ChatGPT()
        self._llm = self._model.llm()
        self._llm_binds_tools = self._llm.bind_tools(self._tools)

    def get_llm_binds_tools(self):
        return self._llm_binds_tools

    def get_tool_node(self):
        return self._tool_node

    def get_llm(self):
        return self._llm


# chat = Chat()
# llm_binds_tools = chat.get_llm_binds_tools()
# result = llm_binds_tools.invoke("Xem thông tin yêu cầu kết bạn của người dùng có id 175995e6-6e16-4c01-8e47-7873b51e424a")
# tool_node = chat.get_tool_node()
# tool_run = tool_node.invoke([result])
# llm = chat.get_llm()
# result = llm.invoke([HumanMessage(content=f"Bạn hãy giúp tôi tạo câu trả lời từ câu hỏi Xem thông tin của tôi và dữ liệu trả về từ api là {tool_run} tạo thành câu trả lời hoàn hảo có thể dùng markdown chỉ trả về câu trả lời đừng nói gì thêm hỏi gì")])
# print(result.content)

