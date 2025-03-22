const user = localStorage.getItem('id')
const pharmacy = localStorage.getItem('pharmacy')
const fetchLiveById = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/users/getUserById/${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch pharmacy data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pharmacy data:", error);
    return null;
  }
};
const fetchNAUById = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/users/nauUsers/${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch pharmacy data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pharmacy data:", error);
    return null;
  }
};
const updateRecord = async(id,updatedData) =>{
  try {
    
    const response = await fetch(
      `http://localhost:5000/users/update/${id}/${user}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update pharmacy data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating pharmacy data:", error);
    return null;
  }
}
const fetchHISUserById = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/users/userHistory/${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch pharmacy data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pharmacy data:", error);
    return null;
  }
};

const fetchAllLive = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/users/getAllUsers"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch all pharmacies");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all pharmacies:", error);
    return [];
  }
};

const fetchAllLiveByRole = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/users/getUsersByRole"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch User");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all pharmacies:", error);
    return [];
  }
};

const fetchAllLiveByPharmacy = async (pharmacyId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/users/getAllUSerByPharmacy/${pharmacyId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch all pharmacies");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all pharmacies:", error);
    return [];
  }
};
const fetchAllNAU = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/users/nauUsers"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch NAU pharmacies");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching NAU pharmacies:", error);
    return [];
  }
};
const fetchAllHIS = async () => {
  try {
    const response = await fetch(
      "http://localhost:5000/users/userHistory"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch HIS pharmacies");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching HIS pharmacies:", error);
    return [];
  }
};
const createUserData = async (changes) => {
  try {
    const response = await fetch(
      `http://localhost:5000/users/createUser/${user}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      }
    );

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Error creating user data:", error);
    return { success: false, message: 'Failed to create user data.' };
  }
};



// Exporting all functions
export default {
  fetchAllLive,
  fetchAllLiveByPharmacy,
  fetchAllNAU,
  fetchAllHIS,

  fetchLiveById,
  fetchNAUById,
  fetchHISUserById,

  updateRecord,


  createUserData,
  fetchAllLiveByRole
};