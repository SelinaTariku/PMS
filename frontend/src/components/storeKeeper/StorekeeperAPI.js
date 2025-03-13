const fetchBranchItemByPharmacy= async(req, res)=>{
    try{
        const pharmacyId=req.params.id;
        const branchItems=await fetch(pharmacyId);
        res.json(branchItems);
    }catch(error){
        console.error("Error fetching branch items:", error);
        res.status(500).json({message: "Server Error"});
    }
}

export default{
    fetchBranchItemByPharmacy
}