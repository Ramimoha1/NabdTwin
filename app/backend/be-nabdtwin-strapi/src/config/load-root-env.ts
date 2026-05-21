import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load the repository root `.env` to keep front-end and back-end environment consistent.
const rootEnv = path.resolve(process.cwd(), '..', '..', '..', '.env');
dotenv.config({ path: rootEnv });