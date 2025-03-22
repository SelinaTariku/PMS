const user = localStorage.getItem('id')

const createData = async (updatedData) => {
  try {
    console.log("Sending data to the server:", updatedData);
    const response = await fetch(
      `http://localhost:5000/branches/createBranch/${user}`,
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

    console.log("Server Response Data:", data);

    return data; 
  } catch (error) {
    console.error("Error creating pharmacy data:", error);
    return null;
  }
};
const getBranchesByPharmacyId = async(id)=>{
  try{
    const response = await fetch(
      `http://localhost:5000/branches/getBranchesByPharmacyId/${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch Branch data");
    }
    const data = await response.json();
    return data;
  }
  catch(error){
    console.error("Error fetching Branch data:", error);
    return null;
  }
}

const updateBranch = async (branchId, updatedData) => {
  try {
    const response = await fetch(`http://localhost:5000/branches/updateBranch/${branchId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (response.status !== 200) {
      throw new Error("Failed to update branch data from API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating branch data:", error);
    return null;
  }
};

export default { 
  createData,
  getBranchesByPharmacyId,
  updateBranch
}