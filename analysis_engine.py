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
    try:
        logging.info(f"Running command: {command}")
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
        stdout, stderr = process.communicate()
    except Exception as e:
        logging.error(f"Failed to run command '{command}'. Exception: {e}")
        return '', f'Command execution exception: {e}', 1

    stdout_decoded = stdout.decode('utf-8')
    stderr_decoded = stderr.decode('utf-8')
    returncode = process.returncode

    if returncode == 0:
        logging.info("Command executed successfully")
    else:
        logging.error(f"Command execution failed. Error: {stderr_decoded}")

    return stdout_decoded, stderr_decoded, returncode

def analyze_directory(directory_path):
    if not os.path.exists(directory_path):
        logging.error(f"Directory path '{directory_path}' does not exist.")
        return {}

    results = {}
    try:
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
    except Exception as e:
        logging.error(f"Failed during analysis. Exception: {e}")

    return results

def post_results(results):
    if not results:
        logging.error("No results to post.")
        return 400, "No results"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    try:
        logging.info("Posting analysis results to the server")
        response = requests.post(RESULTS_ENDPOINT, headers=headers, data=json.dumps(results))
        
        if response.status_code == 200:
            logging.info("Results successfully posted")
        else:
            logging.error(f"Failed to post results. Status: {response.status_code}, Response: {response.text}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Error posting results to server. Exception: {e}")
        return 500, "Failed to connect to results server"
        
    return response.status_code, response.text

def main():
    code_directory_path = "/path/to/your/code"

    if not os.path.exists(code_directory_path):
        logging.error(f"Code directory path '{code_directory_path}' does not exist. Exiting.")
        return

    logging.info(f"Starting analysis for directory: {code_directory_path}")
    analysis_results = analyze_directory(code_directory_path)
    if analysis_results:
        status, response = post_results(analysis_results)
        logging.info(f"Response status: {status}")
        logging.info(f"Response content: {response}")

if __name__ == "__main__":
    main()