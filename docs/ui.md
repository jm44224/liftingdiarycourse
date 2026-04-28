# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do not create custom UI components.
- Do not use other component libraries (MUI, Chakra, Radix directly, etc.).
- If a needed component does not yet exist in the project, add it via the shadcn CLI:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- All shadcn components live in `src/components/ui/` and must not be modified.

## Date Formatting

Use **date-fns** for all date formatting. Dates must follow this format:

| Example output |
|----------------|
| 1st Sep 2025   |
| 2nd Aug 2025   |
| 3rd Jan 2026   |
| 4th Jun 2024   |

Use `format` with the `do MMM yyyy` format token:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```
