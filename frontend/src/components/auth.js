import axios from "axios";

export const fetchProtectedData = async () => {
    const token = localStorage.getItem("token"); 

    if (!token) {
        throw new Error("No authentication token found.");
    }

    try {
        const response = await axios.get("http://localhost:5000/users/protected-data", {
            headers: {
                Authorization: `Bearer ${token}`, 
            },
        });
        return response.data; 
    } catch (error) {
        console.error("Error fetching protected data:", error);
        
        if (error.response && error.response.status === 401) {
            throw new Error("Unauthorized access - please log in again.");
        } else if (error.response && error.response.status === 403) {
            throw new Error("Forbidden access - you do not have the right permissions.");
        } else {
            throw new Error("An error occurred while fetching protected data.");
        }
    }
};