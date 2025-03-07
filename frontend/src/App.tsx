import axios from "axios";
import { useState, useEffect } from "react"
import './App.css'
//import Cookies from "js-cookie";


const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true
});

// Add a request interceptor to set the CSRF token
api.interceptors.request.use(function (config) {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

function App() {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
  });

  const [csvFile, setcsvFile] = useState<File | null>(null);

  useEffect(() => {
    api
      .get("/csrf/", { withCredentials: true })
      .then((response) => {
        console.log("CSRF Token Set:", response.data);
      })
      .catch((error) => console.error("Error fetching CSRF token:", error));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData, [e.target.name]: e.target.value,
    });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setcsvFile(e.target.files[0]);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    if (csvFile) {
      formDataToSend.append('resume', csvFile);
    }

    try {
      //const csrfToken = Cookies.get("csrfToken");
      await api.get("/csrf/", { withCredentials: true });
      const response = await api.post('/api/upload/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      //update the form with extracted resume data
      const extractedData = response.data;
      setFormData({
        name: extractedData.name || '',
        email: extractedData.email || '',
        phone: extractedData.phone || '',
        experience: extractedData.experience || '',
        skills: extractedData.skills || '',
      });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
      }
      console.error('Error uploading file', error);

    }

  }

  return (
    <>
      <div className="container">
        <div className="absolute w-full h-full top-0 left-0 overflow-hidden">
          <div className="signin-signup">
            <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center p-[32px]">
              <h2 className="text-4xl">Resume Form</h2>

              <div className="max-w-[380px] w-full h-[35px] bg-[#f0f0f0] my-[10px] mx-0">
                <input type='text' name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="bg-[#f0f0f0] max-w-[340px] w-full outline-none border-none text-black leading-[1]" />
              </div>
              <div className="max-w-[380px] w-full h-[35px] bg-[#f0f0f0] my-[10px] mx-0">
                <input type='email' name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="bg-[#f0f0f0] max-w-[340px] w-full outline-none border-none text-black leading-[1]" />
              </div>
              <div className="max-w-[380px] w-full h-[35px] bg-[#f0f0f0] my-[10px] mx-0">
                <input type='tel' name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="bg-[#f0f0f0] max-w-[340px] w-full outline-none border-none text-black leading-[1]" />
              </div>
              <div className="max-w-[380px] w-full bg-[#f0f0f0] my-[10px] mx-0">
                <textarea name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience" rows={1} className="bg-[#f0f0f0] max-w-[340px] w-full outline-none border-none text-black resize-none overflow-hidden leading-[1]" />
              </div>
              <div className="max-w-[380px] w-full bg-[#f0f0f0] my-[10px] mx-0">
                <textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills" rows={1} className="bg-[#f0f0f0] max-w-[340px] w-full outline-none border-none text-black resize-none overflow-hidden leading-[1]" />
              </div>

              <input type="file" accept=".csv, .pdf, .docx" onChange={handleFileChange} />
              <button className="w-[150px] h-[49px] border-none outline-none rounded-[49px] cursor-pointer my-[20px] md:my-[10px] uppercase font-[600] hover:bg-[#CBD5E1] transition duration-300" type="submit">Submit</button>

            </form>
          </div>
        </div>

        <div className="absolute h-full w-full top-0 left-0 grid grid-cols-[repeat(2, 1fr)] panel-container">
          <div className="flex flex-col items-end justify-around text-center panel">
            <div className="content">
              <h3>Job Application</h3>
              <p>Lorem ipsum dolor sit amet consectetur elit. Menus impedit quidem quibusdam</p>
              <button className="btn">Apply</button>
            </div>

            <img src="../rocket-launcher.svg" className="image" alt="rocket" />

          </div>

        </div>
      </div>
    </>
  )
}

export default App
