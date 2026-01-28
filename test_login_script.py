import requests
import sys

try:
    url = "http://localhost:8000/api/auth/login/"
    data = {"username": "admin", "password": "admin123"}
    print(f"Testing login at {url}...")
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 200:
        print("Login SUCCESS!")
    else:
        print("Login FAILED!")
        sys.exit(1)
except Exception as e:
    print(f"Exception: {e}")
    sys.exit(1)
