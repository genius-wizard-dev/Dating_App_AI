from typing import TypedDict, List, Any
from langgraph.graph import StateGraph, END
from nodes import Nodes
class State(TypedDict):
    chat_id: str
    question: str
    chat_history: List[Any]
    documents: List[Any]
    generation: Any
    final_generation: str
    error: List[Any]
    next_state: str
    loop_step: int
    is_web_search: bool
    profile_id: str

class Flow:
    def __init__(self):
        nodes = Nodes()
        workflow = StateGraph(State)
        workflow.add_node("history", nodes.history)
        workflow.add_node("route", nodes.route)
        workflow.add_node("tools", nodes.using_tools)
        # workflow.add_node("store", nodes.store)
        workflow.add_node("grade_docs", nodes.grade_docs)
        workflow.add_node("generate", nodes.generate)
        workflow.add_node("grade_generation", nodes.grade_generation)
        workflow.set_entry_point("history")
        workflow.add_node("web", nodes.web_search)
        # Kết nối các node với nhau
        workflow.add_edge("history", "route")
        # Thêm các điều kiện chuyển tiếp
        workflow.add_conditional_edges(
            "route",
            lambda x: x["next_state"],
            {
                "tools": "tools",
                "web": "web",
                # "tool": "generate"
            }
        )
        workflow.add_edge(
            "web",
            "grade_docs"
        )
        workflow.add_conditional_edges(
            "tools",
            lambda x: x["next_state"],
            {
                "useful": END,
                "not_supported": "web",
            }
        )

        workflow.add_conditional_edges(
            "grade_docs",
            lambda x: x["next_state"],
            {
                "generate": "generate",
                "web": "web"
            }
        )

        workflow.add_edge("generate", "grade_generation")

        workflow.add_conditional_edges(
            "grade_generation",
            lambda x: x["next_state"],
            {
                "useful": END,
                "not useful": "web",
                "not supported": "generate",
                "max retries": END
            }
        )
        self._graph = workflow.compile()


    def get_graph(self):
        return self._graph.get_graph().draw_mermaid()


    def run(self, question: str, chat_id: str, profile_id: str):
        initial_state: State = {
            "chat_id": f"chat:{chat_id}",  # Trống hoặc một giá trị mặc định
            "question": question,  # Trống hoặc câu hỏi mặc định
            "chat_history": "",  # Trống hoặc lịch sử chat mặc định
            "documents": [],  # Danh sách tài liệu trống
            "generation": "",  # Generation trống
            "final_generation": "",  # Final generation trống
            "error": [],  # Trạng thái lỗi trống
            "next_state": "history",  # Trạng thái ban đầu, có thể thay đổi tùy theo yêu cầu
            "loop_step": 0,  # Số lần retry ban đầu
            "is_web_search": False,  # Trạng thái web search
            "profile_id": profile_id
        }
        return self._graph.invoke(initial_state)
