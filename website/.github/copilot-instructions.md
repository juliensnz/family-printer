this project is a next.js app, using the app router.
use shadcn ui components with tailwind css to style the UI.
use a custom made translation hook called useI18n that expose a translation method located at @/locales/client.
use absolute path prefixed with @/ when importing local files.
never use abreviated variable names and make them as explicit as possible.
prefer functional approach.
translations are located in the src/locales folder and are en.ts and fr.ts files. Update them when new translations are added in the UI.
name components using camel case
name the component files with the same name as the component
I use the src folder
use type instead of interfaces
to fetch data, use the admin sdk and server actions
never export inline and use a dedicated export statement at the end of the file
style code following .prettierrc.json file
Always use fat arrow functions
