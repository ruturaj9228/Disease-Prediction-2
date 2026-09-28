import httpx
import uuid

session_id = str(uuid.uuid4())
client = httpx.Client(base_url="http://localhost:8000")

print("1. GET (mount)")
res = client.get(f"/api/assessment/{session_id}")
print(res.status_code, res.text)

print("2. POST (send message)")
req = {
    "session_id": session_id,
    "message": "i have headache"
}
res = client.post("/api/chat/message", json=req)
print(res.status_code, res.text)

print("3. GET (load assessment)")
res = client.get(f"/api/assessment/{session_id}")
print(res.status_code, res.text)
