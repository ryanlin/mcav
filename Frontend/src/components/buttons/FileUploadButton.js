import React from "react";
import axios from "axios";

/*************************/
const api_address = "http://localhost:3030/upload_bag"

/*************************/
function FileUploadButton(props) {
  // Handle states using React Hooks
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [fileSelected, setFileSelected] = React.useState(false);

  const changeHandler = (e) => {
    setSelectedFile(e.target.files[0]);
    setFileSelected(true);

    console.log(e.target.files[0].name);
  }

  const onClickUpload = () => {
    const data = new FormData();
    data.append("file", selectedFile);

    axios.post(api_address, data, {
      // receive two parameter endpoint url, form data
    })
    .then(res => {
      // print response status
      console.log(res.statusText)
    })
  }

  const onClickSelect = (e) => {
    document.getElementById("file-upload-id").click();
  }

  return(
    <div>
      <input type="file" name="file" id="file-upload-id"
             onChange={changeHandler}
      hidden/>

      <div className="menu-container-button"
           onClick={onClickSelect}
      >
        <p>{props.optionName}</p>
      </div>

      { fileSelected ?
        <div>
          <p>{selectedFile.name}</p>
          <button
            onClick={onClickUpload}>Upload
          </button>
        </div>
        : null
      }
    </div>
  )
}

export default FileUploadButton;