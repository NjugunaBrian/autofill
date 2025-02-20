import axios from 'axios';

// Configure axios defaults
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.withCredentials = true;

// If you have a base URL for your API:
axios.defaults.baseURL = 'http://localhost:8000';