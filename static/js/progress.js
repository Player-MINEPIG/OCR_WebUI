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

  // 假设你的表格的<tbody>有一个ID为"fileList"
  let tableBody = document.getElementById('fileList');

  filesArray.forEach((file) => {
    let formData = new FormData();
    const newFile = new File([file], `${getFormattedTimestamp()}_${file.name}`, { type: file.type });
    formData.append('file', newFile);
    // formData.append('Debug', 'This is from uploadFile function');
    // 使用fetch API上传文件
    fetch('/ocr/upload_files', {
      method: 'POST',
      body: formData,
    })
      .then(() => {
        // 开始轮询检查上传状态
        checkStatus(newFile.name);
      })
      .catch(error => console.error('Error:', error));

    // 为每个文件创建一个新的表格行
    let row = document.createElement('tr');

    // 创建文件名单元格
    let fileNameCell = document.createElement('td');
    fileNameCell.textContent = newFile.name; // 设置文件名
    row.appendChild(fileNameCell);

    // 创建文件上传状态单元格
    let statusCell = document.createElement('td');
    statusCell.textContent = 'Uploading'; // 初始状态
    statusCell.id = newFile.name; // 为状态单元格设置ID
    row.appendChild(statusCell);

    // 创建开始转换按钮单元格
    let convertCell = document.createElement('td');
    let convertButton = document.createElement('button');
    convertButton.textContent = 'Start Converting';
    // 为按钮添加点击事件处理器
    convertButton.onclick = startConverting;
    convertCell.appendChild(convertButton);
    row.appendChild(convertCell);

    //创建输出文件类型单元格
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

        // 创建文件下载链接单元格
        let downloadCell = document.createElement('td');
        // 下载链接将在文件转换完成后添加
        row.appendChild(downloadCell);

        // 将新行添加到表格的<tbody>中
        const tableRowNumber = tableBody.rows.length;
        if (tableRowNumber > 0) {
          // 如果有，将新行插入到第一行之前
          tableBody.insertBefore(row, tableBody.rows[tableRowNumber - 1]);
        } else {
          // 如果没有现有行，直接添加新行
          tableBody.appendChild(row);
        }
      });
  });


  // // 假设有一个用于更新下载链接的函数
  // let downloadLinks = document.getElementById('downloadLinks');
  // downloadLinks.innerHTML += '<a href="path/to/generated/file" download>Download File</a><br>';
}

function checkStatus(filename) {
  fetch(`/ocr/status/${filename}`)
  .then(response => response.json())
  .then(data => {
      document.getElementById(filename).innerText = `${data.status}`;
      if (data.status === 'Uploading' || data.status === 'Converting') {
          // 如果文件还没上传完，继续轮询
          setTimeout(() => checkStatus(filename), 1000);
      }
  })
  .catch(error => console.error('Error:', error));
}