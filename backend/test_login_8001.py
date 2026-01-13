import requests
try:
    print("Testing connection to 8001...")
    response = requests.post('http://127.0.0.1:8001/api/auth/login/', json={'username': 'admin', 'password': 'admin123'}, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
