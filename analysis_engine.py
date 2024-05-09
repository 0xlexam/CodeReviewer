import subprocess
import os
from dotenv import load_dotenv
import json
import requests
from functools import lru_cache

load_dotenv()

LINTER_TOOL_PATH = os.getenv("LINTER_PATH")
SECURITY_ANALYSIS_TOOL_PATH = os.getenv("SECURITY_SCANNER_PATH")
PERFORMANCE_ANALYSIS_TOOL_PATH = os.getenv("PERFORMANCE_TOOL_PATH")

RESULTS_BACKEND_ENDPOINT = os.getenv("BACKEND_ENDPOINT")
RESULTS_API_KEY = os.getenv("API_KEY")

@lru_cache(maxsize=None)
def execute_tool(command):
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    stdout, stderr = process.communicate()
    return stdout.decode('utf-8'), stderr.decode('utf-8'), process.returncode

def analyze_code_directory(directory_path):
    analysis_results = {}

    lint_output, lint_error, lint_exit_code = execute_tool(f"{LINTER_TOOL_PATH} {directory_path}")
    analysis_results['quality'] = {
        'output': lint_output,
        'error': lint_error,
        'exit_code': lint_exit_code
    }

    security_output, security_error, security_exit_code = execute_tool(f"{SECURITY_ANALYSIS_TOOL_PATH} {directory_path}")
    analysis_results['security'] = {
        'output': security_output,
        'error': security_error,
        'exit_code': security_exit_code
    }

    performance_output, performance_error, performance_exit_code = execute_tool(f"{PERFORMANCE_ANALYSIS_TOOL_PATH} {directory_path}")
    analysis_results['performance'] = {
        'output': performance_output,
        'error': performance_error,
        'exit_code': performance_exit_code
    }

    return analysis_results

def submit_analysis_results(results):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {RESULTS_API_KEY}"
    }
    response = requests.post(RESULTS_BACKEND_ENDPOINT, headers=headers, data=json.dumps(results))
    return response.status_code, response.text

def main():
    target_code_directory = "/path/to/your/code"
    results = analyze_code_directory(target_code_directory)
    status_code, response_message = submit_analysis_results(results)
    
    print(f"Backend response status: {status_code}")
    print(f"Backend response: {response_message}")

if __name__ == "__main__":
    main()