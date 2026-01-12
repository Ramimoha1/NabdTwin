/**
 * Test the Employee Detail API
 * Run this after populating the database
 */

const API_URL = 'http://localhost:3001/api';

async function testApi() {
    console.log("🧪 Testing Employee Detail API...\n");

    try {
        // Get first employee by ID (you'll need to substitute with actual ID)
        console.log("1️⃣ Testing GET /api/employees/details/:id");
        const employeeRes = await fetch(`${API_URL}/employees?pagination[limit]=1`);
        const employees = await employeeRes.json();
        
        if (employees.data && employees.data.length > 0) {
            const empId = employees.data[0].id;
            console.log(`   Found employee ID: ${empId}`);
            
            const detailRes = await fetch(`${API_URL}/employees/details/${empId}`);
            const detail = await detailRes.json();
            
            if (detailRes.ok) {
                console.log("   ✅ Success! Response:");
                console.log(JSON.stringify(detail, null, 2));
            } else {
                console.log("   ❌ Error:", detail);
            }
        }

        // Get employees by branch
        console.log("\n2️⃣ Testing GET /api/employees/by-branch/:branchId");
        const branchRes = await fetch(`${API_URL}/branches?pagination[limit]=1`);
        const branches = await branchRes.json();
        
        if (branches.data && branches.data.length > 0) {
            const branchId = branches.data[0].id;
            console.log(`   Found branch ID: ${branchId}`);
            
            const branchEmpsRes = await fetch(`${API_URL}/employees/by-branch/${branchId}`);
            const branchEmps = await branchEmpsRes.json();
            
            if (branchEmpsRes.ok) {
                console.log("   ✅ Success! Found employees:");
                console.log(JSON.stringify(branchEmps, null, 2));
            } else {
                console.log("   ❌ Error:", branchEmps);
            }
        }

    } catch (error) {
        console.error("❌ Error testing API:", error.message);
    }
}

testApi();
