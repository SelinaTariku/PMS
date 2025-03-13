const createdBy = localStorage.getItem('id')
const fetchLiveById = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/pharmacies/getPharmacyById/${id}`
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
      `http://localhost:5000/pharmacies/getPharmacyNAUById/${id}`
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

const fetchHISById = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/pharmacies/getPharmacyHISById/${id}`
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
      "http://localhost:5000/pharmacies/getAllPharmacies"
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
      "http://localhost:5000/pharmacies/getAllPharmacyNAUs"
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
      "http://localhost:5000/pharmacies/getAllPharmacyHIS"
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
const fetchAllHisRejected = async ()=>{
  try {
    const response = await fetch(
      "http://localhost:5000/pharmacies/getAllRejectedPharmacy"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch HIS rejected pharmacies");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching HIS rejected pharmacies:", error);
    return [];
  }
}
const createData = async (updatedData) => {
  try {
    console.log("Sending data to the server:", updatedData);
    const response = await fetch(
      `http://localhost:5000/pharmacies/createPharmacy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    console.log("Response Status:", response.status);

    const data = await response.json();

    // Log the response data from the server
    console.log("Server Response Data:", data);

    return data; // Return the created data
  } catch (error) {
    console.error("Error creating pharmacy data:", error);
    return null; // Return null if an error occurs
  }
};


const updatePharmacy = async (pharmacyId, updatedData) => {
  try {
    const response = await fetch(`http://localhost:5000/pharmacies/updatePharmacy/${pharmacyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (response.status !== 200) {
      throw new Error("Failed to update pharmacy data from API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating pharmacy data:", error);
    return null;
  }
};

const authorize = async (pharmacyId, createdBy) => {
  try {
    console.log("Pharmacy ID: " + pharmacyId);
    
    const response = await fetch(`http://localhost:5000/pharmacies/autorisePharmacy/${pharmacyId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authorizedBy: localStorage.getItem('id') 
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to authorize pharmacy");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error authorizing pharmacy:", error);
    return null;
  }
}
const reject = async ({ pharmacyId, deletedBy, reason }) => {
  try {
    const response = await fetch(`http://localhost:5000/pharmacies/deletePharmacyNAU/${pharmacyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deletedBy, reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to reject pharmacy');
    }

    return await response.json();
  }
  catch (error) {
    console.error('Error rejecting pharmacy:', error);
    return null;
  }
}


// Exporting all functions
export default {
  fetchLiveById,
  fetchHISById,
  fetchNAUById,

  fetchAllLive,
  fetchAllNAU,
  fetchAllHIS,
  fetchAllHisRejected,

  updatePharmacy,
  createData,
  authorize,
  reject,
};