import subprocess
import os
from dotenv import load_dotenv
import json
import requests
from functools import lru_cache

load_dotenv()

LINTER_PATH = os.getenv("LINTER_PATH")
SECURITY_SCANNER_PATH = os.getenv("SECURITY_SCANNER_PATH")
PERFORMANCE_TOOL_PATH = os.getenv("PERFORMANCE_TOOL_PATH")

RESULTS_ENDPOINT = os.getenv("BACKEND_ENDPOINT")
API_KEY = os.getenv("API_KEY")

@lru_cache(maxsize=None)
def run_command(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    stdout, stderr = process.communicate()
    return stdout.decode('utf-8'), stderr.decode('utf-8'), process.returncode

def analyze_directory(directory_path):
    results = {}

    quality_output, quality_error, quality_status = run_command(f"{LINTER_PATH} {directory_path}")
    results['quality'] = {
        'output': quality_output,
        'error': quality_error,
        'status': quality_status
    }

    security_output, security_error, security_status = run_command(f"{SECURITY_SCANNER_PATH} {directory_path}")
    results['security'] = {
        'output': security_output,
        'error': security_error,
        'status': security_status
    }

    performance_output, performance_error, performance_status = run_command(f"{PERFORMANCE_TOOL_PATH} {directory_path}")
    results['performance'] = {
        'output': performance_output,
        'error': performance_error,
        'status': performance_status
    }

    return results

def post_results(results):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.post(RESULTS_ENDPOINT, headers=headers, data=json.dumps(results))
    return response.status_code, response.text

def main():
    code_directory_path = "/path/to/your/code"
    analysis_results = analyze_directory(code_directory_path)
    status, response = post_results(analysis_results)
    
    print(f"Response status: {status}")
    print(f"Response content: {response}")

if __name__ == "__main__":
    main()