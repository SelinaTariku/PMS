const pharmacy = localStorage.getItem('pharmacy')
const fetchBranchByPharmacy = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/branches/branchOverviewByPharmacy/${pharmacy}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pharmacy branches data");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching pharmacy data:", error);
      return null;
    }
  };

  const fetchAllNAU = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/branches/getUnauthorizedBranchesByPharmacyId/${pharmacy}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch NAU branches");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching NAU branches:", error);
      return [];
    }
  };





  const fetchLiveById = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/users/users/${id}`
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
  const updateRecord = async(updatedData,id) =>{
    try {
      
      const response = await fetch(
        `http://localhost:5000/users/update/${id}`,
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
        `http://localhost:5000/users/getAllUSerByPharmacy/${pharmacy}`
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
  const createUserData = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/users/createUser${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: id,
            address: {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "",
            },
            contactInfo: {
              phone: "",
              email: "",
            },
            noOfBranch: "",
            name: "",
            mnemonic: "",
            logo: "",
            brandColor: "",
            licenseExpirationDate: "",
            branches: [],
            owner: "",
            status: "",
            feedback: [],
            createdAt: "",
            licenseNumber: "",
            CURR: "",
            __v: "",
            authorisedAt: "",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create pharmacy data");
      }
      const data = await response.json();
      return data; // Return the created data
    } catch (error) {
      console.error("Error creating pharmacy data:", error);
      return null;
    }
  };
  
  export default {
    fetchAllLive,
    fetchAllNAU,
    fetchAllHIS,
  
    fetchLiveById,
    fetchNAUById,
    fetchHISUserById,
  
    updateRecord,
  
  
    createUserData,


    fetchBranchByPharmacy,
    fetchAllLive,
    fetchAllNAU,
    fetchAllHIS,

    fetchLiveById
  }