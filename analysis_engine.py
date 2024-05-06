import subprocess
import os
from dotenv import load_dotenv
import json
import requests
load_dotenv()
LINTER_PATH = os.getenv("LINTER_PATH")
SECURITY_SCANNER_PATH = os.getenv("SECURITY_SCANNER_PATH")
PERFORMANCE_TOOL_PATH = os.getenv("PERFORMANCE_TOOL_PATH")
BACKEND_ENDPOINT = os.getenv("BACKEND_ENDPOINT")
API_KEY = os.getenv("API_KEY")
def run_tool(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    stdout, stderr = process.communicate()
    return stdout.decode('utf-8'), stderr.decode('utf-8'), process.returncode
def analyze_code(code_directory):
    results = {}
    quality_stdout, quality_stderr, quality_returncode = run_tool(f"{LINTER_PATH} {code_directory}")
    results['quality'] = {
        'output': quality_stdout,
        'error': quality_stderr,
        'returncode': quality_returncode
    }
    security_stdout, security_stderr, security_returncode = run_tool(f"{SECURITY_SCANNER_PATH} {code_directory}")
    results['security'] = {
        'output': security_stdout,
        'error': security_stderr,
        'returncode': security_returncode
    }
    performance_stdout, performance_stderr, performance_returncode = run_tool(f"{PERFORMANCE_TOOL_PATH} {code_directory}")
    results['performance'] = {
        'output': performance_stdout,
        'error': performance_stderr,
        'returncode': performance_returncode
    }
    return results
def send_results_to_backend(results):
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}
    response = requests.post(BACKEND_ENDPOINT, headers=headers, data=json.dumps(results))
    return response.status_code, response.text
def main():
    code_directory = "/path/to/your/code"
    analysis_results = analyze_code(code_directory)
    status_code, response_text = send_results_to_backend(analysis_results)
    print(f"Backend response status: {status_code}")
    print(f"Backend response: {response_text}")
if __name__ == "__main__":
    main()