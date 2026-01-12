
const API_URL = 'http://localhost:3001/api';

/**
 * DATABASE CLEANUP SCRIPT
 * Deletes all data in the correct order to respect foreign key constraints
 * Run this before populate.js to ensure no duplicates
 */
async function nukeDatabase() {
    console.log("💣 NUKING DATABASE - This will delete ALL data!\n");

    const deleteAll = async (endpoint) => {
        try {
            const res = await fetch(`${API_URL}/${endpoint}?pagination[pageSize]=9999`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const json = await res.json();
            const records = json.data || [];
            
            let deleted = 0;
            for (const record of records) {
                try {
                    await fetch(`${API_URL}/${endpoint}/${record.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    deleted++;
                } catch (err) {
                    console.error(`  Failed to delete ${endpoint}/${record.id}:`, err.message);
                }
            }
            
            if (deleted > 0) {
                console.log(`🗑️  Deleted ${deleted} ${endpoint}`);
            }
            return deleted;
        } catch (err) {
            console.error(`Error deleting ${endpoint}:`, err.message);
            return 0;
        }
    };

    console.log("Deleting records in dependency order...\n");

    // Delete in reverse order of dependencies
    await deleteAll('employee-skills');      // Depends on employees, skills
    await deleteAll('employee-kpis');        // Depends on employees
    await deleteAll('satisfaction-surveys'); // Depends on employees, branches
    await deleteAll('branch-financials');    // Depends on branches
    await deleteAll('branch-kpis');          // Depends on branches
    await deleteAll('employees');            // Depends on department, team, branch, floor, supervisor
    await deleteAll('workspaces');           // Depends on floors
    await deleteAll('floors');               // Depends on branches
    await deleteAll('teams');                // Depends on department, branch, leaderEmployee
    await deleteAll('departments');          // Depends on branch, organization, headEmployee
    await deleteAll('branches');             // Depends on organization
    await deleteAll('skills');               // No dependencies
    await deleteAll('organizations');        // Root entity

    console.log("\n✅ DATABASE NUKED! Ready for fresh populate.js run\n");
}

nukeDatabase().catch(err => {
    console.error('NUKE FAILED:', err);
    process.exit(1);
});
