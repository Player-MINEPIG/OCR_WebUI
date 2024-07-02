from flask import (
    Flask,
    request,
    render_template,
    send_file,
    redirect,
    url_for,
    jsonify,
    send_from_directory,
)
import atexit
import logging
from logging.handlers import RotatingFileHandler
import os
import datetime
from ocr import (
    pdf_to_text,
    img_to_text,
    check_file_type,
    load_settings,
    save_settings,
)

app = Flask(__name__)


# redirect to the OCR page
@app.route("/")
def upload_file():
    app.logger.info("Default page accessed")
    return redirect(url_for("ocr"))


# Render the OCR page
@app.route("/ocr", methods=["GET"])
def ocr():
    app.logger.info("OCR page accessed")
    return render_template("ocr.html")


# upload files
@app.route("/ocr/upload_files", methods=["POST"])
def upload_files():
    f = request.files["file"]
    # check if the file type is supported
    if not check_file_type(f.filename, settings["supported_input_file_types"]):
        file_status[f.filename] = "Fail to upload"
        app.logger.error(f"Unsupported file type: {f.filename}")
        return jsonify({"message": "Unsupported file type"}), 400
    file_status[f.filename] = "Uploading"
    app.logger.info(f"File uploading: {f.filename}")
    # upload the file
    if f:
        file_path = os.path.join("uploads", f.filename)
        f.save(file_path)
        file_status[f.filename] = "Uploaded"
        app.logger.info(f"File uploaded: {f.filename}")
        return jsonify({"message": "File uploaded"}), 200

    app.logger.error("File upload failed")
    return


# check the status of the file
@app.route("/ocr/status/<filename>", methods=["GET"])
def check_status(filename):
    status = file_status.get(filename, "未找到")
    app.logger.info(f"File status checked: {filename} - {status}")
    return jsonify({"status": status}), 200


# convert the file
@app.route("/ocr/converting", methods=["POST"])
def converting():
    file_name = request.form["fileName"]
    #  output contribution
    output_type = request.form["outputType"]
    output_file = f"{os.path.splitext(file_name)[0]}.{output_type}"
    output_path = os.path.join("output", output_file)
    # check if the file has been converted
    if file_status.get(file_name, "未找到") == "Converted" and os.path.exists(
        output_path
    ):
        app.logger.info(f"File already converted: {file_name}")
        return jsonify({"outputFile": output_file}), 200
    file_type = file_name.split(".")[-1].lower()
    file_path = os.path.join("uploads", file_name)
    # check if the file exists
    if (
        file_name not in file_status
        or file_status[file_name] == "Fail to upload"
        or not os.path.exists(file_path)
    ):
        file_status[file_name] = "Fail to convert"
        app.logger.error(f"File not found: {file_name}")
        return jsonify({"message": "File not found"}), 404
    #  check if the file is uploaded
    elif file_status[file_name] != "Uploaded":
        file_status[file_name] = "Fail to convert"
        app.logger.error(f"File not uploaded: {file_name}")
        return jsonify({"message": "File not uploaded"}), 400
    file_status[file_name] = "Converting"
    #  convert the file
    if file_type in ["pdf"]:
        pdf_to_text(file_path, output_path)
    elif file_type in ["png", "jpg", "jpeg"]:
        img_to_text(file_path, output_path)
    file_status[file_name] = "Converted"
    app.logger.info(f"File converted: {file_name}")
    app.logger.info(f"Output path: {output_path}")
    settings["preferred_output_file_type"] = output_type
    save_settings(settings)
    app.logger.info("Preferred output file type setting saved")
    return jsonify({"outputFile": output_file}), 200


# generate the download link
@app.route("/ocr/download/<filename>", methods=["GET"])
def download_file(filename):
    app.logger.info(f"Download link generated: /ocr/download/{filename}")
    return send_from_directory("output", filename, as_attachment=True)


# get the supported input file types
@app.route("/ocr/api/supported_output_file_types")
def supported_file_types():
    file_types = settings["supported_output_file_types"]
    # put preferred_output_file_type in the first place
    file_types.remove(settings["preferred_output_file_type"])
    file_types.insert(0, settings["preferred_output_file_type"])
    return jsonify(file_types)


# initialize the server
def initialize():
    # Initialize the uploads and output folders
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    if not os.path.exists("output"):
        os.makedirs("output")
    # Create a settings file if it does not exist
    if not os.path.exists("settings.json"):
        with open("settings.json", "w") as f:
            json.dump(
                {
                    "output_path": "output",
                    "supported_input_file_types": ["pdf", "png", "jpg", "jpeg"],
                    "supported_output_file_types": [
                        "txt",
                        "md",
                        "xml",
                        "json",
                        "csv",
                        "html",
                    ],
                    "preferred_output_file_type": "md",
                },
                f,
            )


# clean up the cache
def cleanup_cache():
    # Clean up the uploads and output folders
    for folder in ["uploads", "output"]:
        for file in os.listdir(folder):
            os.remove(os.path.join(folder, file))
    app.logger.info("Cache cleaned up")


initialize()
settings = load_settings()
file_status = {}

if __name__ == "__main__":
    atexit.register(cleanup_cache)
    # Create a new log
    # Create a log folder if it does not exist
    if not os.path.exists("logs"):
        os.makedirs("logs")
    app.logger.setLevel(logging.INFO)
    current_time = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = os.path.join("logs", f"log_{current_time}.log")
    file_handler = RotatingFileHandler(
        log_file, maxBytes=1024 * 1024 * 100, backupCount=10
    )
    app.logger.addHandler(file_handler)

    app.logger.info("Server initialized")
    app.logger.info("Starting server")
    app.run()
