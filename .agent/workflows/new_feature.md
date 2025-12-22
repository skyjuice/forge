---
description: Workflow for adding new tool modules/features to IbuForge
---

# Feature Development Workflow

Follow this process when adding a new tool or module to the IbuForge application to ensure consistency and quality.

## 1. Product Requirement Definition (PRD)
Before writing code, clearly define the feature in `implementation_plan.md`:
-   **Goal**: What problem does this tool solve?
-   **User Story**: "As a user, I want to [action] so that [benefit]."
-   **Key Features**: List specific capabilities (e.g., "Multi-file upload", "Drag and drop").
-   **Constraints**:
    -   **Privacy**: All processing must happen client-side if possible.
    -   **Tech Stack**: Use Next.js, Shadcn UI, and existing libraries (e.g., `pdf-lib`, `ffmpeg`).

## 2. Design & UI Standardization
Ensure the new tool matches the application's theme:
-   **Route**: Create a new directory `app/tools/[dashes-name]`.
-   **Layout**: Use the standard centered layout with a `Max-Width` container.
-   **Components**:
    -   **Card**: Wrap the main interface in a Shadcn `Card`.
    -   **Upload**: Use the shared `Dropzone` component.
    -   **Privacy Notice**: **MANDATORY**. Include the `<PrivacyNotice />` component at the top of the card content.
    -   **Icons**: Use `lucide-react` icons consistent with other tools.

## 3. Implementation Steps
1.  **Scaffold**: Create the `page.tsx` and necessary API routes (if server-side processing is absolutely required).
2.  **Dashboard**: Add the new tool to the list in `app/page.tsx` with a relevant Icon and Description.
3.  **Logic**: Implement the core functionality.
    -   *Prefer client-side logic* (WebAssembly, JS libraries) to reduce server cost and improve privacy.
4.  **Error Handling**: specific error states for failed uploads or processing errors.

## 4. Verification
1.  **Manual Test**: Create a `walkthrough.md` logic.
2.  **Privacy Check**: Verify the `PrivacyNotice` is visible.
3.  **Responsiveness**: Check mobile and desktop views.
4.  **Edge Cases**: Test with 0 files, large files, and invalid file types.
