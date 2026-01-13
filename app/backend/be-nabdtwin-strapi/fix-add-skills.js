/**
 * Fix script - Add skills to existing employees
 */

const API_URL = 'http://localhost:3001/api';

async function addSkills() {
    console.log("🎯 Adding skills to employees...\n");

    const post = async (endpoint, data) => {
        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        const json = await res.json();
        if (!res.ok) {
            console.error(`Error: ${json.error?.message || 'Unknown error'}`);
            return null;
        }
        return json;
    };

    // Get skills
    const skillsRes = await fetch(`${API_URL}/skills?pagination[pageSize]=100`);
    const skillsData = await skillsRes.json();
    const skillsByName = {};
    skillsData.data.forEach(s => skillsByName[s.name] = s.id);

    // Employee skills mapping (from populate-with-employees.js)
    const employeeSkills = {
        'ahmed.hassan@company.com': ['React', 'Node.js', 'TypeScript', 'AWS'],
        'fatima.ali@company.com': ['Figma', 'Adobe XD', 'Prototyping'],
        'omar.saleh@company.com': ['Roadmapping', 'User Research', 'Agile'],
        'maha.khalil@company.com': ['Automation', 'Cypress', 'Playwright'],
        'yousef.rashid@company.com': ['Spark', 'Airflow', 'Python'],
        'dana.fahd@company.com': ['React', 'TypeScript', 'Vite'],
        'hussain.naser@company.com': ['SIEM', 'Threat Hunting', 'Azure'],
        'rania.samir@company.com': ['Scrum', 'Kanban', 'Facilitation'],
        'ziad.mansour@company.com': ['PyTorch', 'MLOps', 'Python'],
        'huda.yasin@company.com': ['Azure', 'Microservices', 'Networking'],
        'tariq.jaber@company.com': ['Troubleshooting', 'SLA Management', 'Azure'],
        'rami.yassein@company.com': ['Leadership', 'Strategy', 'Fundraising']
    };

    // Get employees
    const empRes = await fetch(`${API_URL}/employees?pagination[pageSize]=100`);
    const empData = await empRes.json();

    let created = 0;
    for (const emp of empData.data) {
        const skills = employeeSkills[emp.email];
        if (skills) {
            console.log(`Adding skills to ${emp.firstName} ${emp.lastName}...`);
            for (const skillName of skills) {
                const skillId = skillsByName[skillName];
                if (skillId) {
                    const result = await post('employee-skills', {
                        employee: emp.id,
                        skill: skillId,
                        proficiencyLevel: 'advanced'
                    });
                    if (result) created++;
                }
            }
        }
    }

    console.log(`\n✅ Created ${created} employee-skill records`);
}

addSkills().catch(err => console.error("Error:", err));
