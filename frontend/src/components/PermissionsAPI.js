const fetchPermissions = async (userId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/permissions/getUserPermissions/${userId}`
    );

    if (!response.ok) {
      throw new Error("You currently do not have any permissions. Please contact your manager for assistance.");
    }

    const data = await response.json();
 return data; 
  } catch (error) {
    console.error("Failed to load permissions:", error);
    return { error: error.message };
  }
};

const fetchPageNames = async (id) => {
  try {
    const response = await fetch(
      `http://localhost:5000/pages/getPageById/${id}`
    );
}
catch (error) {
  console.error("Failed to load permissions:", error);
  return { error: error.message };
}
}

export default {fetchPermissions,fetchPageNames};
