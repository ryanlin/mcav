import React from "react";

function UploadButton(props) {

  const changeHandler = (e) => {
    props.onClick(e.target.files[0].path);
  }

  const onClickButton = (e) => {
    document.getElementById("file-upload-id").click();
  }

  return(
    <div>
      {/* input element that actually handels upload */}
      <input type="file" name="file" id="file-upload-id"
             onChange={changeHandler}
      hidden/>

      {/* button that looks nice */}
      <button
        className="menu-container-button"
        onClick={() => props.onClick("uploadbutton")}
      >
        {props.text}
      </button>
    </div>
  )
}

export default UploadButton;