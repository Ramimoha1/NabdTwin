const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');

// --- Configuration ---
const INPUT_SQL_FILE = 'schema.txt';
const OUTPUT_DIR = path.join(process.cwd(), 'strapi-schemas-simple'); // Output to a new folder
const API_DIR = path.join(OUTPUT_DIR, 'src', 'api');

// Map SQL types to Strapi types
const TYPE_MAP = {
    'VARCHAR': 'string',
    'TEXT': 'text',
    'INTEGER': 'integer',
    'INT': 'integer',
    'DECIMAL': 'decimal',
    'DATE': 'date',
    'TIMESTAMP': 'datetime',
    'BOOLEAN': 'boolean',
    'JSONB': 'json',
    'INET': 'string', // IP address type
    'UUID': 'string' // Treating all UUIDs as strings for manual conversion later
};

// --- Helper Functions ---

/**
 * Normalizes a table name (e.g., 'branch_kpis' to 'branch-kpi')
 * @param {string} name
 * @returns {string}
 */
function normalizeTableName(name) {
    // Converts snake_case to kebab-case and handles pluralization for singular name
    const singular = pluralize.singular(name);
    return singular.toLowerCase().replace(/_/g, '-');
}

/**
 * Creates the base Strapi schema object
 * @param {string} tableName - The original SQL table name (e.g., 'organizations')
 * @returns {object} The base schema JSON structure
 */
function createBaseSchema(tableName) {
    const singularName = pluralize.singular(tableName);
    const apiName = normalizeTableName(tableName);

    return {
        kind: 'collectionType',
        collectionName: tableName,
        info: {
            singularName: apiName,
            pluralName: pluralize.plural(apiName),
            displayName: singularName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            description: ''
        },
        options: {
            draftAndPublish: false,
            timestamps: true
        },
        attributes: {}
    };
}


// --- Main Parsing Logic ---

function convertSqlToStrapi(sqlContent) {
    const schemas = {};
    const createTableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
    let tableMatch;

    while ((tableMatch = createTableRegex.exec(sqlContent)) !== null) {
        const tableName = tableMatch[1];
        const tableBody = tableMatch[2].trim();
        const apiName = normalizeTableName(tableName);

        const schema = createBaseSchema(tableName);
        const attributeLines = tableBody.split(/,(\s*\n)/).map(s => s.trim()).filter(s => s && !s.startsWith('--'));

        // 2. Parse individual attributes
        for (const line of attributeLines) {
            const fieldMatch = line.match(/^(\w+)\s+([A-Z]+[^(]*)(?:\(([^)]+)\))?\s*(.*)$/i);
            if (!fieldMatch) continue;

            const [_, fieldName, sqlType, sqlParamsRaw, constraints] = fieldMatch;

            // Skip auto-managed fields
            if (['id', 'created_at', 'updated_at'].includes(fieldName)) continue;

            let strapiType = 'string';
            let strapiAttributes = {};
            const sqlParams = sqlParamsRaw ? sqlParamsRaw.split(',').map(p => p.trim()) : [];
            const constraintsUpper = constraints.toUpperCase();

            let baseSqlType = sqlType.toUpperCase().split(' ')[0];

            // --- CRITICAL CHANGE: MAPPING ALL UUIDs/FKs TO STRING ---
            if (baseSqlType === 'DECIMAL') {
                strapiType = 'decimal';
                strapiAttributes.precision = parseInt(sqlParams[0] || 15);
                strapiAttributes.scale = parseInt(sqlParams[1] || 2);
            } else if (baseSqlType === 'VARCHAR') {
                strapiType = 'string';
                strapiAttributes.maxLength = parseInt(sqlParams[0] || 255);
            } else {
                // This covers UUID, TEXT, INT, DATE, JSONB, etc.
                strapiType = TYPE_MAP[baseSqlType] || 'string';
            }
            // --------------------------------------------------------

            // 5. Constraint Mapping

            // Enumerations (CHECK (col IN (...)))
            const enumMatch = line.match(/CHECK \(\w+ IN \(([^)]+)\)\)/i);
            if (enumMatch) {
                const enumValues = enumMatch[1].split(',').map(v => v.replace(/'/g, '').trim());
                strapiType = 'enumeration';
                strapiAttributes.enum = enumValues;
            }

            if (constraintsUpper.includes('NOT NULL')) {
                strapiAttributes.required = true;
            }
            if (constraintsUpper.includes('UNIQUE')) {
                // Ignore composite UNIQUE keys for now
                if (!line.includes('UNIQUE(')) {
                    strapiAttributes.unique = true;
                }
            }
            if (constraintsUpper.includes('DEFAULT')) {
                const defaultValueMatch = constraints.match(/DEFAULT (?:'([^']+)'|(\w+))/i);
                if (defaultValueMatch) {
                    strapiAttributes.default = defaultValueMatch[1] || defaultValueMatch[2];

                    if (strapiType === 'integer' && !isNaN(parseInt(strapiAttributes.default))) {
                        strapiAttributes.default = parseInt(strapiAttributes.default);
                    }
                }
            }

            // Add the final attribute to the schema
            schema.attributes[fieldName] = { type: strapiType, ...strapiAttributes };
        }

        schemas[apiName] = schema;
    }

    return schemas;
}


// --- Execution ---

console.log(`Starting Strapi Schema Generation (Simple Mode)...`);
console.log(`Reading SQL from: ${INPUT_SQL_FILE}`);

try {
    const sqlContent = fs.readFileSync(INPUT_SQL_FILE, 'utf8');
    const generatedSchemas = convertSqlToStrapi(sqlContent);

    // Create necessary directories
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(API_DIR, { recursive: true });

    let fileCount = 0;

    // Write Schemas to Files
    for (const apiName in generatedSchemas) {
        const schema = generatedSchemas[apiName];
        const singularName = schema.info.singularName;

        const contentTypesDir = path.join(API_DIR, apiName, 'content-types', singularName);
        fs.mkdirSync(contentTypesDir, { recursive: true });

        const filePath = path.join(contentTypesDir, 'schema.json');

        schema.info.description = `Schema for the ${schema.collectionName} table. Relationships must be added manually.`;

        fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
        fileCount++;
    }

    console.log(`\n✅ Success! Generated ${fileCount} schema files in: ${OUTPUT_DIR}`);
    console.log(`\n*** NEXT STEPS (Manual Relation Setup) ***`);
    console.log(`1. Copy the contents of '${API_DIR}' into your Strapi project's 'src/api' folder.`);
    console.log(`2. Run 'npm run develop' or 'yarn develop'. The server should now start.`);
    console.log(`3. Go to the Strapi Admin Panel -> Content-Type Builder.`);
    console.log(`4. For each table, edit the former Foreign Key fields (e.g., 'branch_id', 'organization_id', 'employee_id').`);
    console.log(`5. **Delete** the existing 'branch_id' (string) field and re-create it as a **Relation** field to the target content type.`);

} catch (error) {
    console.error(`\n❌ Error during schema generation:`, error.message);
    console.log(`Make sure the '${INPUT_SQL_FILE}' file exists and is readable.`);
}