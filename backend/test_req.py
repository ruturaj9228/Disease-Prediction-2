import httpx
import uuid

session_id = str(uuid.uuid4())
client = httpx.Client(base_url="http://localhost:8000")

req = {
    "session_id": session_id,
    "message": "i have headache"
}
try:
    res = client.post("/api/chat/message", json=req)
    print("STATUS:", res.status_code)
    print("RESPONSE:", res.text)
except Exception as e:
    print("ERROR:", e)
