import os
import json
from pdf2image import convert_from_path
import pytesseract
from PIL import Image


def check_file_type(file_type, supported_types):
    if file_type.split(".")[-1].lower() not in supported_types:
        print(
            "Unsupported file type. Please read the README.md file for more information."
        )
        return False
    return True


def pdf_to_images(pdf_path):
    return convert_from_path(pdf_path)


def images_to_text(images):
    text = ""
    for image in images:
        text += pytesseract.image_to_string(image) + "\n\n"
    return text


def save_text_to_file(text, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)


def pdf_to_text(pdf_path, output_path):
    images = pdf_to_images(pdf_path)
    print("pdf has been converted to images.")
    text = images_to_text(images)
    print("Images have been converted to text.")
    save_text_to_file(text, output_path)


def img_to_text(img_path, output_path):
    image = Image.open(img_path)
    save_text_to_file(images_to_text([image]), output_path)


def load_settings():
    with open("settings.json", "r") as f:
        settings = json.load(f)
    return settings


def save_settings(settings):
    with open("settings.json", "w") as f:
        json.dump(settings, f)


if __name__ == "__main__":

    settings = load_settings()

    input_path = input("Please input the file path:")
    # delete ''
    input_path = input_path.strip("'")
    # get file type
    input_file_type = input_path.split(".")[-1].lower()
    # check file type
    if not check_file_type(input_file_type, settings["supported_input_file_types"]):
        exit(1)

    print("The default output folder path is: ", settings["output_path"])
    print("The default output file type is: ", settings["preferred_output_file_type"])
    # whether use default settings
    if input("Do you want to use the default settings? (y/n):").lower() == "y":
        output_path = settings["output_path"]
        output_type = settings["output_type"]
    else:
        output_path = input("Please input the output folder path:")
        output_path = output_path.strip("'")
        output_type = input("Please input the output file type (e.g. txt, md ...):")
        output_type = output_type.strip(".")
        output_type = output_type.lower()
    if not check_file_type(
        output_type, settings["supported_preferred_output_file_types"]
    ):
        exit(1)
    # save settings
    settings["output_path"] = output_path
    settings["preferred_output_file_type"] = output_type
    save_settings(settings)
    print("The settings have been saved.")

    output_path = (
        output_path
        + os.sep
        + os.path.basename(input_path.split(os.sep)[-1]).replace(
            input_file_type, output_type
        )
    )

    if input_file_type == "pdf":
        pdf_to_text(input_path, output_path)
    elif input_file_type in ["png", "jpg", "jpeg"]:
        img_to_text(input_path, output_path)
    print("Convert successfully!")
