import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const socket = io(API_URL); 

export default socket;
