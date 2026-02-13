## Summary
- Create Drizzle ORM schema with resumes and tailored_resumes tables
- Set up Neon PostgreSQL connection module
- Configure drizzle.config.ts and migration scripts
- Successfully pushed schema to Neon database

## Test plan
- Build passes with `npm run build`
- Schema pushed to Neon DB successfully via `npx drizzle-kit push`

Closes #2
