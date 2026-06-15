import axios from 'axios';

const getBaseURL = () => {
  const host = window.location.hostname;
  const port = window.location.port;
  // If running on React dev server, route to backend port 8000
  if (port === '5173' || port === '3000') {
    return `http://${host}:8000/api/`;
  }
  // If served directly by Django, use relative URL
  return '/api/';
};

const client = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent back and forth if needed
});

export default client;

