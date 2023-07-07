import asyncio
import os
from typing import List
from .utils import *
import reflex as rx

URL = 'http://110.93.240.107:8080/uploadfile/'
def get_diarization_results(file_path):
    response_dict = send_file(url=URL,file_path=file_path)
    print(response_dict)
    if response_dict['status']:
        segments = response_dict['msg']
        return segments
    else:
        return response_dict['msg']
    
def outside_function(input_dict):
    print(input_dict)
    return True


class CallAnalytics:
    def __init__(self) -> None:
        self.data = []

    def input_speaker_data(self,input_dict):
        self.data.append(input_dict)

    def print_data(self):
        print('==================== Data we have ============================')
        print(self.data)


call_analytics = CallAnalytics()

class State(rx.State):
    """The app state."""

    # Whether we are currently uploading files.
    is_uploading: bool

    @rx.var
    def file_str(self) -> str:
        """Get the string representation of the uploaded files."""
        return "\n".join(os.listdir(rx.get_asset_path()))

    async def handle_upload(self, files: List[rx.UploadFile]):
        """Handle the file upload."""
        self.is_uploading = True

        # Iterate through the uploaded files.
        for file in files:
            print(file.filename)
            upload_data = await file.read()
            outfile = rx.get_asset_path(file.filename)
            with open(outfile, "wb") as file_object:
                file_object.write(upload_data)
            speaker_response = get_diarization_results(outfile)
            call_analytics.input_speaker_data(speaker_response)
            call_analytics.print_data()

        # Stop the upload.
        return State.stop_upload
    

    async def stop_upload(self):
        """Stop the file upload."""
        await asyncio.sleep(1)
        self.is_uploading = False


color = "rgb(107,99,246)"


def index():
    return rx.vstack(
        rx.upload(
            rx.button(
                "Select File(s)",
                height="70px",
                width="200px",
                color=color,
                bg="white",
                border=f"1px solid {color}",
            ),
            rx.text(
                "Drag and drop files here or click to select files",
                height="100px",
                width="200px",
            ),
            border="1px dotted black",
            padding="2em",
        ),
        rx.hstack(
            rx.button(
                "Upload",
                on_click=State.handle_upload(rx.upload_files()),
            ),
        ),
        rx.heading("Files:"),
        rx.cond(
            State.is_uploading,
            rx.progress(is_indeterminate=True, color="blue", width="100%"),
            rx.progress(value=0, width="100%"),
        ),
        rx.text_area(
            is_disabled=True,
            value=State.file_str,
            width="100%",
            height="100%",
            bg="white",
            color="black",
            placeholder="No File",
            min_height="20em",
        ),
    )


# Add state and page to the app.
app = rx.App(state=State)
app.add_page(index, title="Upload")
app.compile()
