import React, { useState } from "react";
import axios from "axios";


const Demo = () => {
  const [demo, setFile] = useState(null);
  const [imageurl, setImageUrl] = useState('');
  const url = 'http://localhost:1337/api/userinfos'
  const [dataForm, setData] = useState({
    name: '',
    date: '',
    uid: '',
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setData((prev) => {
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const formData = new FormData();

    formData.append("files", demo);
    const upload_res = await axios({
      method: "post",
      url: "http://localhost:1337/api/upload",
      data: formData
    })
    console.log('Saved');
    
  };

  return (<>
    <form onSubmit={handleSubmit}>
      <input type='file' onChange={(e) => { setFile(e.target.files[0]) }} />
    
      <button type='submit'>Submit</button>
    </form>
  </>)
}

export default Demo