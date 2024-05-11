import subprocess
import os
from dotenv import load_dotenv
import json
import requests
from functools import lru_cache
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

LINTER_PATH = os.getenv("LINTER_PATH")
SECURITY_SCANNER_PATH = os.getenv("SECURITY_SCANNER_PATH")
PERFORMANCE_TOOL_PATH = os.getenv("PERFORMANCE_TOOL_PATH")

RESULTS_ENDPOINT = os.getenv("BACKEND_ENDPOINT")
API_KEY = os.getenv("API_KEY")

@lru_cache(maxsize=None)
def run_command(command):
    logging.info(f"Running command: {command}")
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    stdout, stderr = process.communicate()
    stdout_decoded = stdout.decode('utf-8')
    stderr_decoded = stderr.decode('utf-8')
    returncode = process.returncode
    if returncode == 0:
        logging.info("Command executed successfully")
    else:
        logging.error(f"Command execution failed. Error: {stderr_decoded}")
    return stdout_decoded, stderr_decoded, process.returncode

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
    logging.info("Posting analysis results to the server")
    response = requests.post(RESULTS_ENDPOINT, headers=headers, data=json.dumps(results))
    if response.status_code == 200:
        logging.info("Results successfully posted")
    else:
        logging.error(f"Failed to post results. Status: {response.status_code}, Response: {response.text}")
    return response.status_code, response.text

def main():
    code_directory_path = "/path/to/your/code"
    logging.info(f"Starting analysis for directory: {code_directory_path}")
    analysis_results = analyze_directory(code_directory_path)
    status, response = post_results(analysis_results)
    
    logging.info(f"Response status: {status}")
    logging.info(f"Response content: {response}")

if __name__ == "__main__":
    main()