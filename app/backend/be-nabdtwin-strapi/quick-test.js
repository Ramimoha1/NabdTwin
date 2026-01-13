/**
 * Quick test of the employee details endpoint
 * Make sure Strapi is running on localhost:3001
 */

const API_URL = 'http://localhost:3001/api';

async function quickTest() {
    console.log("🧪 Quick Employee API Test\n");

    try {
        // Test 1: Get all employees (standard endpoint)
        console.log("1️⃣ Getting all employees...");
        const response = await fetch(`${API_URL}/employees?pagination[pageSize]=2`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const firstEmp = data.data[0];
            console.log(`   ✅ Found ${data.data.length} employees`);
            console.log(`   First employee ID: ${firstEmp.id}`);
            console.log(`   First employee: ${firstEmp.firstName} ${firstEmp.lastName}\n`);
            
            // Test 2: Get detailed employee info
            console.log("2️⃣ Getting detailed employee info...");
            const detailResponse = await fetch(`${API_URL}/employees/details/${firstEmp.id}`);
            const detailData = await detailResponse.json();
            
            if (detailResponse.ok) {
                console.log("   ✅ SUCCESS! Employee details:");
                console.log(JSON.stringify(detailData, null, 2));
            } else {
                console.log("   ❌ Error:", detailData);
            }
        } else {
            console.log("   ⚠️ No employees found. Run populate-with-employees.js first!");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("\n💡 Make sure:");
        console.log("   1. Strapi is running (npm run develop)");
        console.log("   2. Database has been populated (node populate-with-employees.js)");
    }
}

quickTest();
