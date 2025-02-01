from langchain.schema.messages import AIMessage, HumanMessage, SystemMessage
from langchain.schema.document import Document
from html import unescape
import json
from typing import Dict, Any
from database import RedisStore, SupabaseStore
from models import Groq, ChatGPT
import redis
from prompts import Prompt
from tools import WebSearch, Chat
class Nodes:
    def __init__(self):
        self._store = RedisStore()
        self._model = ChatGPT()
        self._llm = self._model.llm()
        self._llm_json_model = self._model.llm_json_model()
        self._retriver = self._store.as_retriver()
        self._prompt = Prompt()
        self._websearch = WebSearch()
        self._chat = Chat()
        self._llm_bind_tools = self._chat.get_llm_binds_tools()
        self._supabase_store = SupabaseStore()
        self._tool_node = self._chat.get_tool_node()
        self._client = self._supabase_store.get_client()
    @staticmethod
    def _ai_to_json(ai: AIMessage):
        try:
            return json.loads(ai.content)
        except json.JSONDecodeError:
            print("Error decoding AI response")
            return {}

    def history(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # print("\nHISTORY")
        chat_id = state.get("chat_id")
        if not chat_id:
            error_message = "Chat ID not found in state."
            print(error_message)
            state["error"] = error_message
            state["next_state"] = "route"
            return state

        try:
            # Truy xuất lịch sử trò chuyện từ Redis
            chat_history = self._store.get_history(chat_id)

            # Kiểm tra xem có lịch sử trò chuyện hay không
            if not chat_history:
                # print("No chat history found")
                state["chat_history"] = []
                state["next_state"] = "route"
                return state

            # Giới hạn số lượng tin nhắn cần tóm tắt
            max_history_length = 5
            if len(chat_history) > max_history_length:
                chat_history = chat_history[-max_history_length:]

            # Tóm tắt lịch sử trò chuyện chỉ khi cần thiết
            if len(chat_history) > 2:  # Nếu có đủ lịch sử để tóm tắt
                summary_instruction = """
                Tóm tắt lịch sử các câu hỏi và trả lời:
                {chat_history}
                """
                chat_history_summary = self._llm.invoke(
                    [HumanMessage(content=summary_instruction.format(chat_history=chat_history))])

                # Kiểm tra nếu có lỗi trong quá trình tóm tắt
                if not chat_history_summary or not hasattr(chat_history_summary, 'content'):
                    error_message = "Error while summarizing chat history."
                    print(error_message)
                    state["error"] = error_message
                    state["next_state"] = "route"
                    return state

                chat_history = chat_history_summary.content

            state["chat_history"] = chat_history
            state["next_state"] = "route"

        except redis.RedisError as redis_error:
            error_message = f"Redis error: {str(redis_error)}"
            print(error_message)
            state["error"] = error_message
            state["next_state"] = "route"

        except Exception as e:
            error_message = f"Unexpected error: {str(e)}"
            print(error_message)
            state["error"] = error_message
            state["next_state"] = "route"

        return state

    def route(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # print("\nROUTE")
        question = state.get("question")

        try:
            # Gọi LLM để quyết định nguồn dữ liệu
            decision = self._llm_json_model.invoke(
                [SystemMessage(content=self._prompt.route_intructions), HumanMessage(content=question)])

            # Giải mã kết quả từ AI
            decision = self._ai_to_json(decision)

            # Kiểm tra nguồn dữ liệu và quyết định tiếp theo
            if decision.get("datasource") in ["tools", "web"]:
                state["next_state"] = decision["datasource"]
            else:
                state["next_state"] = "generate"

        except KeyError as e:
            # Nếu gặp lỗi KeyError khi truy cập dữ liệu từ decision, in lỗi và lưu vào state
            error_message = f"Error decoding AI response: Missing key {str(e)}"
            print(error_message)

            # Lưu thông tin lỗi vào state
            if "error" not in state:
                state["error"] = []  # Nếu chưa có trường "error", tạo mới
            state["error"].append(error_message)  # Thêm lỗi vào danh sách lỗi

            # Đặt trạng thái tiếp theo là "store" vì có lỗi xảy ra
            state["next_state"] = "generate"

        except Exception as e:
            # Bắt tất cả các lỗi khác
            error_message = f"Unexpected error: {str(e)}"
            print(error_message)

            # Lưu thông tin lỗi vào state
            if "error" not in state:
                state["error"] = []  # Nếu chưa có trường "error", tạo mới
            state["error"].append(error_message)  # Thêm lỗi vào danh sách lỗi

            # Đặt trạng thái tiếp theo là "store" vì có lỗi xảy ra
            state["next_state"] = "generate"

        return state

    def using_tools(self, state: Dict[str, Any]) -> Dict[str, Any]:
        question = state["question"]
        response = self._llm_bind_tools.invoke([SystemMessage(content=self._prompt.tool_instructions.format(profile_id=state["profile_id"])), HumanMessage(content=question)])
        print(response)
        if response.tool_calls:
            tool_run = self._tool_node.invoke([response])
            final_result = self._llm.invoke([HumanMessage(content=self._prompt.tool_prompt.format(question=question, tool_run=tool_run))])
            print(final_result)
            state["final_generation"] = final_result.content
            self._store.save_history(state['chat_id'], question, final_result.content)
            state["next_state"] = "useful"
        else:
          state["next_state"] = "not_supported"
        return state

    # def store(self, state: Dict[str, Any]) -> Dict[str, Any]:
    #     # print("\nSTORE")
    #     question = state.get("question")
    #
    #     try:
    #         # Gọi retriever để lấy kết quả
    #         results = self._retriver.invoke(question)
    #
    #         # Kiểm tra kết quả trả về
    #         if not results or len(results) == 0:
    #             # print("No documents found")
    #             state["next_state"] = "web"
    #             state["documents"] = []
    #         else:
    #             state["documents"] = results
    #             state["next_state"] = "grade_docs"
    #
    #     except Exception as e:
    #         # Bắt lỗi nếu có ngoại lệ trong quá trình gọi retriever
    #         error_message = f"Error during document retrieval: {str(e)}"
    #         print(error_message)
    #
    #         # Lưu thông tin lỗi vào state
    #         if "error" not in state:
    #             state["error"] = []  # Nếu chưa có trường "error", tạo mới
    #         state["error"].append(error_message)  # Thêm lỗi vào danh sách lỗi
    #
    #         # Đặt trạng thái tiếp theo là "web" vì có lỗi xảy ra
    #         state["next_state"] = "web"
    #         state["documents"] = []  # Không có tài liệu, trả về danh sách trống
    #
    #     return state


    def grade_docs(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # print("\nGRADE DOCS")
        question = state.get("question")
        docs = state.get("documents", [])
        min_relevant_docs = state.get("min_relevant_docs", 1)
        relevant_docs = 0
        errors = []  # Danh sách để lưu các lỗi gặp phải
        doc_relevant = []
        for index, doc in enumerate(docs):
            doc = doc.page_content
            try:
                # Gọi API LLM để đánh giá tài liệu
                grade = self._llm_json_model.invoke([SystemMessage(content=self._prompt.doc_grader_instructions),
                                    HumanMessage(content=self._prompt.doc_grader_prompt.format(documents=doc, question=question))])
                # Chuyển đổi kết quả từ AI thành JSON
                grade = self._ai_to_json(grade)
                # Kiểm tra sự liên quan của tài liệu
                if grade.get("relevant").lower() == "yes":
                    # print(f"Document {index + 1}: Relevant")
                    doc_relevant.append(doc)
                    relevant_docs += 1
                else:
                    pass
                    # print(f"Document {index + 1}: Not Relevant")
            except Exception as e:
                error_message = f"Error grading document {index}: {str(e)}"
                print(error_message)
                errors.append(error_message)
        # Nếu có lỗi xảy ra, lưu vào state
        if errors:
            state["error"] = errors  # Ghi lại tất cả các lỗi vào state để theo dõi

        # Kiểm tra số tài liệu phù hợp với yêu cầu và điều hướng trạng thái
        state["documents"] = doc_relevant
        if relevant_docs >= min_relevant_docs:
            state["next_state"] = "generate"
        elif not state.get("is_web_search", False):
            state["next_state"] = "web"
        else:
            state["next_state"] = "generate"
        return state

    def generate(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # print("\nGENERATE")
        try:
            if state.get("error"):
                state["generation"] = "Xin lỗi, tôi không có đủ thông tin để trả lời câu hỏi này."

                state["error"] = state["error"]
                state["next_state"] = "grade_generation"
                return state
            question = state["question"]
            documents = state["documents"]
            history = state["chat_history"]
            prompt = self._prompt.generate_prompt.format(
                history=history,
                documents=documents,
                question=question
            )
            generation = self._llm.invoke([
                HumanMessage(content=prompt)
            ])

            state["generation"] = generation.content
            state["next_state"] = "grade_generation"

            return state

        except Exception as e:
            print(f"Error in generate: {e}")
            state["generation"] = "Đã xảy ra lỗi khi xử lý câu hỏi của bạn."
            state["error"] = str(e)
            state["next_state"] = "grade_generation"
            return state


    def grade_generation(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # print("\nĐÁNH GIÁ GENERATION")
        loop_step = state.get("loop_step", 0)
        try:
            # Lấy thông tin từ state
            question, documents, generation, is_web_search = state["question"], state["documents"], state["generation"], state["is_web_search"]

            # Kiểm tra trạng thái lỗi
            if state.get("error"):
                print("Trạng thái lỗi phát hiện")
                state["next_state"] = "max retries"
                return state

            # Hàm xử lý retry và lưu lịch sử
            def handle_retries():
                if loop_step >= 3:
                    print("Đã đạt số lần retry tối đa")
                    state["final_generation"] = generation
                    self._store.save_history(state['chat_id'], question, generation)
                    state["next_state"] = "max retries"
                    return True
                return False

            # Kiểm tra lỗi trong generation
            if any(phrase in generation.lower() for phrase in ["xin lỗi", "không có thông tin", "không thể trả lời", "không tìm thấy"]):
                if handle_retries(): return state
                print("Phát hiện thông điệp lỗi")
                state["loop_step"] = loop_step + 1
                state["next_state"] = "not supported"
                return state


            # Đánh giá sự nhất quán với tài liệu (hallucination)
            hall_result = self._llm_json_model.invoke([
                 SystemMessage(content=self._prompt.generate_docs_instructions),
                HumanMessage(content=self._prompt.generate_docs_prompt.format(documents=documents, generation=generation))
            ])

            if self._ai_to_json(hall_result)["score"].lower() != "yes":
                if handle_retries(): return state
                print("Phát hiện hallucination")
                state["next_state"] = "not useful"
                state["loop_step"] = loop_step + 1
                return state

            # Đánh giá tính liên quan với câu hỏi
            answer_result = self._llm_json_model.invoke([SystemMessage(content=self._prompt.generate_question_instructions),
                HumanMessage(content=self._prompt.generate_question_prompt.format(question=question, generation=generation))
            ])

            if self._ai_to_json(answer_result)["score"].lower() == "yes":
                # print("Câu trả lời hợp lệ")
                state["final_generation"] = generation
                self._store.save_history(state['chat_id'], question, generation)
                state["next_state"] = "useful"
                state["loop_step"] = loop_step + 1
                return state

            if handle_retries():
                state["loop_step"] = loop_step + 1
                return state

            # print("Câu trả lời không liên quan")
            state["loop_step"] = loop_step + 1
            if is_web_search:
                state["next_state"] = "not supported"
            else:
                state["next_state"] = "not useful"
            return state

        except Exception as e:
            print(f"Lỗi: {e}")
            state["loop_step"] = loop_step + 1
            state["next_state"] = "not useful"
            return state

    def web_search(self, state: Dict[str, Any]) -> Dict[str, Any]:
        # print("\nWEB SEARCH")
        try:
            question = state["question"]
            type_search = self._llm_json_model.invoke([
                SystemMessage(content=self._prompt.search_intructions),
                HumanMessage(content=self._prompt.search_prompt.format(question=question))
            ])
            type_search = self._ai_to_json(type_search)["type"]
            if type_search.lower() not in ["maps", "search"]:
                type_search = "search"

            try:
                search_results = self._websearch.serper_search(question, type_search)
            except (json.JSONDecodeError, TypeError):
                search_results = []

            state["is_web_search"] = True
            state["documents"] = search_results
            state["next_state"] = "grade_docs"
            return state

        except Exception as e:
            print(f"Error in web search: {e}")
            state["is_web_search"] = True
            state["next_state"] = "grade_docs"
            return state




