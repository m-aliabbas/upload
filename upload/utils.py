import json
import requests

def send_file(url: str, file_path: str):
    """
    Sends an audio file to a server-side API endpoint for speaker diarization.

    Args:
        url (str): The URL of the server-side API endpoint.
        file_path (str): The path to the audio file to be processed.

    Returns:
        dict: The server-side response in JSON format.
    """
    
    # Define the headers for the POST request
    headers = {
        'accept': 'application/json',
    }
    
    # Open the audio file in binary mode
    with open(file_path, 'rb') as f:
        # Prepare the file data for the POST request
        files = {'file': f}
        # Send the POST request to the server-side API endpoint
        response = requests.post(url, headers=headers, files=files)

        print(response.text)
        # Convert the server-side response to JSON format
        json_response = response.json()
        
    
    # Return the server-side response
    return json_response

URL = 'http://110.93.240.107:8080/uploadfile/'
def get_diarization_results(file_path):
    response_dict = send_file(url=URL,file_path=file_path)
    print(response_dict)
    # if response_dict['status']:
    #     segments = response_dict['msg']
    #     return segments
    # else:
    #     return response_dict['msg']
    return {'asfas':'asfaf'}

# a=get_diarization_results('/home/ali/Desktop/idrak_work/danish/upload/.web/public/backy.wav')
