//first fetch api is generated by copilot, others are written by myself

function dragOverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();
  if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      document.getElementById('file').files = ev.dataTransfer.files;
      uploadFile(); // Call the upload function
  }
}

function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

function startConvertingAll() {
  // Implement the conversion logic here
  // Update the download link after the conversion
  const tableBody = document.getElementById('fileList');
  const rows = tableBody.rows;
  for (let i = 0; i < rows.length-1; i++) {
    const convertButton = rows[i].getElementsByTagName('button')[0];
    startConverting.call(convertButton);
  }
}


function startConverting() {
  // Implement the conversion logic here
  // Update the download link after the conversion
  const outputTypeCell = this.parentElement.nextElementSibling;
  const downloadCell = outputTypeCell.nextElementSibling;
  const statusCell = this.parentElement.previousElementSibling;
  statusCell.innerText = 'Converting';
  const fileName= statusCell.id;
  let formData = new FormData();
  formData.append('fileName', fileName);
  formData.append('outputType', outputTypeCell.firstChild.value);
  // formData.append('Debug', 'This is from startConverting function');
  fetch('/ocr/converting', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      checkStatus(fileName);
      //验证是否存在下载链接
      if (data.outputFile === undefined) {
        downloadCell.innerHTML = 'Fail to convert';
        return;
      }
      // const baseUrl = window.location.origin; // 获取网站的根URL
      // const fullPath = baseUrl + data.outputFile; // 构造完整的文件URL
      downloadCell.innerHTML = `<a href="/ocr/download/${data.outputFile}" download>Download File</a>`;
      // downloadCell.innerHTML = `<a href="${data.outputFile}" download>Download File</a>`;
    })
}

function uploadFile() {
  // Implement the upload logic here
  // Update the progress bar during the upload
  let fileInput = document.getElementById('file');
  // console.log(fileInput.files.length);
  const filesArray = Array.from(fileInput.files); // 将文件对象转换为数组

  let tableBody = document.getElementById('fileList');

  filesArray.forEach((file) => {
    let formData = new FormData();
    const newFile = new File([file], `${getFormattedTimestamp()}_${file.name}`, { type: file.type });
    formData.append('file', newFile);
    // formData.append('Debug', 'This is from uploadFile function');
    fetch('/ocr/upload_files', {
      method: 'POST',
      body: formData,
    })
      .then(() => {
        // 开始轮询检查上传状态
        checkStatus(newFile.name);
      })
      .catch(error => console.error('Error:', error));

    // create a new row
    let row = document.createElement('tr');

    // create a new cell for file name
    let fileNameCell = document.createElement('td');
    fileNameCell.textContent = newFile.name; // 设置文件名
    row.appendChild(fileNameCell);

    // create a new cell for status
    let statusCell = document.createElement('td');
    statusCell.textContent = 'Uploading'; 
    statusCell.id = newFile.name;
    row.appendChild(statusCell);

    // create a new cell for convert button
    let convertCell = document.createElement('td');
    let convertButton = document.createElement('button');
    convertButton.textContent = 'Start Converting';
    // set the click event for the convert button
    convertButton.onclick = startConverting;
    convertCell.appendChild(convertButton);
    row.appendChild(convertCell);

    // create a new cell for output type
    let outputTypeCell = document.createElement('td');
    let outputTypeSelect = document.createElement('select');
    fetch('/ocr/api/supported_output_file_types')
      .then(response => response.json())
      .then(data => {
        data.forEach((outputType) => {
          outputTypeSelect.appendChild(new Option(outputType, outputType));
        });
        outputTypeCell.appendChild(outputTypeSelect);
        row.appendChild(outputTypeCell);

        //  create a new cell for download link
        let downloadCell = document.createElement('td');
        row.appendChild(downloadCell);

        // add the new row to the table before the existing last row
        const tableRowNumber = tableBody.rows.length;
        if (tableRowNumber > 0) {
          tableBody.insertBefore(row, tableBody.rows[tableRowNumber - 1]);
        } else {
          tableBody.appendChild(row);
        }
      });
  });
}

function checkStatus(filename) {
  fetch(`/ocr/status/${filename}`)
  .then(response => response.json())
  .then(data => {
      document.getElementById(filename).innerText = `${data.status}`;
      if (data.status === 'Uploading' || data.status === 'Converting') {
          setTimeout(() => checkStatus(filename), 1000);
      }
  })
  .catch(error => console.error('Error:', error));
}