# OCR WebUI

## Intro

This is a project used to take texts out of files that cannot directly select the texts. It has command-line version, but I'll recommend the webui version. The following texts without special explanation are all refer to the webui version.

As for the AIPC is developing fast, soon the only superiority of this project which is privacy will disappear. So this is just a project for study purpose. If you wish to use it, I appreciate it, but still appeal you to find some more mature projects.

## Supported system, language

Developed on macOS, tested on macOS, windows.

Ocr only supports English. If you wish to recognize other language, please download other language packs from Tesseract.

## Install

This project is based on Python. So please install python first.

1. Open the terminal, navigate to the folder where you want to put this app.

2. enter `git clone link` to download the project
3. enter `cd name` to navigate to the root folder

4. enter `pip install requirements.txt` to download requirements
5. enter `python webui.py` to start the webui
6. enter ctrl+c to stop the server

## Usage

Here will introduce the normal work flow with this app.

### Start

1. Open the terminal, navigate to the folder, and enter `python webui.py` to start the webui. Do not close the terminal.
2. Open the browser, enter the link shown in the terminal. Usually it is `http://127.0.0.1:5000`. Now the webui should be shown there.

### Upload the file

1. Drag files or click the block to upload the file. The file name will be shown in that block. Each file will generate a new row.
   ![image-20240702104240508](/Users/pmp/Library/Application Support/typora-user-images/image-20240702104240508.png)

​		Once the upload succeeds, the status grid will become "Uploaded".

 2. Choose a text file type from the checkbox

    ![image-20240702104720049](/Users/pmp/Library/Application Support/typora-user-images/image-20240702104720049.png)

    The new generated row will automatically choose the last chosen one.

3. Once the upload completes, click on the "Start Converting" button to start the conversion.

   Once the conversion succeeds, the status grid will become "Converted". And a download link will appear in the file download grid. Click the link to download the converted file.

   ![image-20240702104936139](/Users/pmp/Library/Application Support/typora-user-images/image-20240702104936139.png)

   If you wish to convert all the files listed, click on the "Start Converting" button on the head of the table.



## UI

![image-20240702104413019](/Users/pmp/Library/Application Support/typora-user-images/image-20240702104413019.png)

### File Upload

This is where you upload your files.
Click or drop file(s) there to upload.
Once the upload starts, the file name with a time stamp will be shown there, no matter it uploads successfully or not.
Once the upload succeeds, the file will be temporarily saved in the uploads folder.

### Status

This is where you can know how the file is being processed.

There are n status listed below

- Not uploaded

  No file has been uploaded.

- Uploading

  The file is uploading.

- Uploaded

  The file is uploaded successfully.

- Converting

  The original file is converting to the text file.

- Converted

  The original file is converted successfully to the text file.

- Fail to upload

  The file upload is failed. This can be caused by some reason listed below.

  - File type is not supported. (Only support `pdf, jpg, jpeg, png` now)
  - If you are setting up this project on a server, bad network can also be a reason.

- Fail to convert

  The file conversion is failed. This can be caused by some reason listed below.

  - File not found (file not uploaded yet or deleted)
  - File type is not supported. (Only support `pdf, jpg, jpeg, png` now)

### Start Converting

A button used to start converting process.

When the converted file exist, it will not process again. i.e. If you really want it to process again, you need to upload the file again or manually delete the output file in the output folder. 

Changing the output file type will let it process again.

### Output File Type

A checkbox used to select the output file type.

Support `md, txt, xml, json, csv, html` now. If you wish to add more types, you can edit the `settings.json` file manually. But the result is not assured.

### File Download

This is where the download link appears.
Once the conversion succeeds, a temporary file will be saved in the output folder. And a link to it will be generated.



## File Structure

### ocr.py

This is the core of this project. It can be used alone as well.

### webui.py

This is the webui codes.

### templates & static

These are webui components.

As for this is an individual project, codes with home page has been deleted.

### uploads & output

These are where the files are saved temporarily. Once the program exits normally, i.e. use ctrl+c to exit manually or out of errors it automatically exits, these two folders will be cleaned up. If you wish to keep those files, please edit `webui.py`.

### settings.json

Mainly used in the command-line version. In webui version, it helps storage the supported types and the preferred output file type.

### logs

The folder where logs are storaged.

### Readme.md

This file.

## Command-line version

1. install
2. `python ocr.py`
3. follow the command-line tips.