import requests
import time

# --- CONFIGURATION ---
BASE_URL_NODE = "http://localhost:3000"
BASE_URL_PYTHON_VIDEO = "http://localhost:8001"
BASE_URL_FRONTEND = "http://localhost:5173"

print("==================================================")
print("   SANDBOX SECURITY TESTING SCRIPT (DAST SIMULATION) ")
print("==================================================")
print("This script simulates automated security testing against the local sandbox.")
print("Ensure your docker-compose services are running before execution.")
print("==================================================\n")

# 1. RATE LIMITING TEST (Brute-force simulation)
print("[*] TEST 1: Rate Limiting & Brute-force Prevention")
def test_rate_limiting():
    # Giả lập gửi 50 request liên tục đến endpoint đăng nhập hoặc trang chủ
    endpoint = f"{BASE_URL_NODE}/api/login" # Đổi endpoint nếu cần
    success_count = 0
    blocked_count = 0
    
    print(f"    -> Gửi 50 requests tới {endpoint}...")
    for i in range(50):
        try:
            # Gửi payload giả
            res = requests.post(endpoint, json={"username": "admin", "password": f"pass{i}"}, timeout=2)
            if res.status_code == 429: # Too Many Requests
                blocked_count += 1
            else:
                success_count += 1
        except requests.exceptions.RequestException:
            pass
            
    if blocked_count > 0:
        print(f"    [+] PASS: Hệ thống có cơ chế chặn brute-force (bị chặn {blocked_count}/50 requests).")
    else:
        print(f"    [-] FAIL: Hệ thống không giới hạn request (Rate Limiting). Nguy cơ bị brute-force!")

test_rate_limiting()
print("")

# 2. SQL INJECTION (SQLi) BASIC TEST
print("[*] TEST 2: SQL Injection (SQLi) Basic Check")
def test_sqli():
    # Giả lập payload SQL injection cơ bản vào endpoint tìm kiếm phim
    endpoint = f"{BASE_URL_NODE}/api/movies/search?q=' OR '1'='1" 
    try:
        res = requests.get(endpoint, timeout=3)
        if res.status_code == 500 or "syntax error" in res.text.lower() or "mysql" in res.text.lower():
            print("    [-] FAIL: Lỗi SQL Injection tiềm ẩn! Server trả về lỗi Database khi nhận ký tự đặc biệt.")
        elif res.status_code == 200 and len(res.json()) > 100: # Nếu tự nhiên trả về toàn bộ DB
            print("    [-] FAIL: Lỗi SQL Injection! Truy vấn trả về toàn bộ dữ liệu thay vì từ khóa.")
        else:
            print("    [+] PASS: Không phát hiện lỗi SQLi cơ bản. Đầu vào có vẻ đã được filter.")
    except Exception as e:
        print("    [!] Không thể kết nối tới endpoint search.")

test_sqli()
print("")

# 3. CORS MISCONFIGURATION TEST
print("[*] TEST 3: Cross-Origin Resource Sharing (CORS) Check")
def test_cors():
    # Kiểm tra xem server có mở cửa cho mọi domain không (CORS misconfig)
    headers = {"Origin": "http://evil-hacker.com"}
    try:
        res = requests.options(f"{BASE_URL_NODE}/", headers=headers, timeout=3)
        if res.headers.get("Access-Control-Allow-Origin") == "*":
            print("    [-] FAIL: CORS được cấu hình mở (Allow-Origin: *). Rủi ro rò rỉ dữ liệu qua tên miền khác!")
        elif res.headers.get("Access-Control-Allow-Origin") == "http://evil-hacker.com":
            print("    [-] FAIL: Server tin tưởng mọi Origin gửi tới! Cực kỳ nguy hiểm.")
        else:
            print("    [+] PASS: CORS được cấu hình an toàn (Từ chối Origin lạ).")
    except Exception as e:
        print("    [!] Không thể test CORS lúc này.")

test_cors()
print("\n==================================================")
print("Hoàn tất quét sơ bộ. Vui lòng xem file báo cáo chi tiết để biết thêm các lỗ hổng từ Dependencies.")
print("==================================================")
